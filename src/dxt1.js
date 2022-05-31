

/*

    Basically just a port of: 
    https://github.com/nothings/stb/blob/master/stb_dxt.h

*/


// INIT

let expand5 = new Uint8Array(32).map((v, i) => (i<<3)|(i>>2));
let expand6 = new Uint8Array(64).map((v, i) => (i<<2)|(i>>4));

let oMatch5 = new Uint8Array(256*2);
let oMatch6 = new Uint8Array(256*2);


function clamp(v, min, max) {
    return Math.max(Math.min(v, max), min);
}

function lerp3(v1, v2) {
    return (2*v1 + v2) / 3;
}

function rgb565(r, g, b) {
    return (r & 0b1111100000000000) | ((g >> 5) & 0b0000011111100000) | ((b >> 11) & 0b0000000000011111);
}

function prepareOptTable(table, expand, size) {
    for(let i=0; i < 256; i++) {
        let bestErr = 256;
        for(let mn=0; mn < size; mn++) {
            for(let mx=0; mx < size; mx++) {
                let min = expand[mn];
                let max = expand[mx];
                let err = Math.abs(lerp3(max, min) - i);

                err += Math.abs(max - min) * 3 / 100;

                if(err < bestErr) {
                    table[i*2] = mx;
                    table[i*2+1] = mn;
                    bestErr = err;
                }
            }
        }
    }
}

prepareOptTable(oMatch5, expand5, 32);
prepareOptTable(oMatch6, expand6, 64);


function eval_colors(c0, c1) {
    const r0 = expand5[(c0 & 0b1111100000000000) >> 11];
    const g0 = expand6[(c0 & 0b0000011111100000) >> 5];
    const b0 = expand5[(c0 & 0b0000000000011111)];

    const r1 = expand5[(c1 & 0b1111100000000000) >> 11];
    const g1 = expand6[(c1 & 0b0000011111100000) >> 5];
    const b1 = expand5[(c1 & 0b0000000000011111)];
    
    return new Uint8Array([
        r0, g0, b0, 0,
        r1, g1, b1, 0,
        lerp3(r0, r1), lerp3(g0, g1), lerp3(b0, b1),
        lerp3(r1, r0), lerp3(g1, g0), lerp3(b1, b0),
    ]);
}

function optimize_color_block(block) {

    let mind = 0x7fffffff;
    let maxd = -0x7fffffff;
    let minp = 0;
    let maxp = 0;
    let magn = 0;
    let v_r = 0; let v_g = 0; let v_b = 0;

    const iterPower = 4;

    let covf = new Float32Array(6);
    let vfr = 0; let vfg = 0; let vfb = 0;

    let cov = new Uint32Array(6);
    let mu = new Uint8Array(3);
    let min = new Uint8Array(3);
    let max = new Uint8Array(3);

    // Get max/min for each color channel
    for(let ch=0; ch < 3; ch++) {
        let muv = 0; let minv = 0; let maxv = 0;
        muv = minv = maxv = block[ch];

        for(let i=ch; i < 64; i+=4) {
            muv += block[i];
            if(block[ch] < minv) minv = block[ch];
            else if(block[ch] > maxv) maxv = block[ch];
        }

        mu[ch] = (muv + 8) >> 4;
        min[ch] = minv;
        max[ch] = maxv;
    }

    // covariance matrix
    for(let i=0; i < 16; i++) {
        const r = block[i*4] - mu[0];
        const g = block[i*4+1] - mu[1];
        const b = block[i*4+2] - mu[2];

        cov[0] += r*r;
        cov[1] += r*g;
        cov[2] += r*b;
        cov[3] += g*g;
        cov[4] += g*b;
        cov[5] += b*b;
    }

    // covariance matrix to float
    for(let i=0; i < 6; i++) {
        covf[i] = cov[i] / 255;
    }

    vfr = max[0] - min[0];
    vfg = max[1] - min[1];
    vfb = max[2] - min[2];

    // find principal axis via power iter
    for(let iter=0; iter < iterPower; iter++) {
        vfr = vfr*covf[0] + vfg*covf[1] + vfb*covf[2];
        vfg = vfr*covf[1] + vfg*covf[3] + vfb*covf[4];
        vfb = vfr*covf[2] + vfg*covf[4] + vfb*covf[5];
    }

    magn = Math.max(Math.abs(vfr), Math.abs(vfg), Math.abs(vfb));

    if(magn < 4) {
        v_r = 299;
        v_g = 587;
        v_b = 114;
    } else {
        magn = 512 / magn;
        v_r = vfr * magn;
        v_g = vfg * magn;
        v_g = vfb * magn;
    }


    for(let i=0; i < 16; i++) {
        const dot = block[i*4+0]*v_r + block[i*4+1]*v_g + block[i*4+2]*v_b;

        if(dot < mind) {
            mind = dot;
            minp = block+i*4;
        }

        if(dot > maxd) {
            maxd = dot;
            maxp = block+i*4;
        }
    }


    return {
        max16: rgb565(maxp[0], maxp[1], maxp[2]),
        min16: rgb565(minp[0], minp[1], minp[2])
    }
}




function match_colors_block(block, color) {

    let mask = 0;
    let dirr = color[0] - color[4];
    let dirg = color[1] - color[5];
    let dirb = color[2] - color[6];
    let dots = new Uint32Array(16);
    let stops = new Uint32Array(4);

    for(let i=0; i < 16; i++) {
        dots[i] = block[i*4]*dirr + block[i*4+1]*dirg + block[i*4+2]*dirb;
    }

    for(let i=0; i < 4; i++) {
        stops[i] = color[i*4]*dirr + color[i*4+1]*dirg + color[i*4+2]*dirb;
    }


    let c0Point = (stops[1] + stops[3]) >> 1;
    let halfPoint = (stops[3] + stops[2]) >> 1;
    let c3Point = (stops[2] + stops[0]) >> 1;

    for(let i=15; i >=0; i--) {
        const dot = dots[i];
        mask <<= 2;
        if(dot < halfPoint) {
            mask |= (dot < c0Point) ? 1 : 3;
        } else {
            mask |= (dot < c3Point) ? 2 : 0;
        }
    }

    return mask;

}



function refine_block(block, pmax16, pmin16, mask) {

    const w1Tab = new Uint8Array([3, 0, 2, 1]);
    const prods = new Uint32Array([0x090000, 0x000900, 0x040102, 0x010402]);

    let frb = 0, fg = 0;
    let oldMin = 0x0000; let oldMax = 0x0000; let min16 = 0x0000; let max16 = 0x0000;

    oldMin = pmin16;
    oldMax = pmax16;

    if(mask & (mask << 2) < 4) {
        let r=8; let g=8; let b=8;
        for(let i=0; i < 16; i++) {
            r += block[i*4];
            g += block[i*4+1];
            b += block[i*4+2];
        }

        r >>= 4; g >>= 4; b >>= 4;

        max16 = rgb565(oMatch5[r][0], oMatch6[g][0], oMatch5[b][0]);
        min16 = rgb565(oMatch5[r][1], oMatch6[g][1], oMatch5[b][1]);
    } else {
        let at1_r = 0; let at1_g = 0; let at1_b = 0;
        let at2_r = 0; let at2_g = 0; let at2_b = 0;
        let cm = mask;
        let akku = 0;
        for(let i=0; i < 16; i++, cm >>= 2) {
            const step = cm & 3;
            const w1 = w1Tab[step];
            const r = block[i*4];
            const g = block[i*4+1];
            const b = block[i*4+2];

            akku += prods[step];
            at1_r += w1*r;
            at1_g += w1*g;
            at1_b += w1*b;
            at2_r += r;
            at2_g += g;
            at2_b += b;
        }

        at2_r = 3*at2_r - at1_r;
        at2_g = 3*at2_g - at1_g;
        at2_b = 3*at2_b - at1_b;

        const xx = akku >> 16;
        const yy = (akku >> 8) & 0xFF;
        const xy = akku & 0xFF;

        const frb = 3 * 31 / 255 / (xx*yy - xy*xy);
        const fg = frb * 63 / 31;

        max16 = clamp((at1_r*yy - at2_r*xy)*frb+0.5, 0, 31) << 11;
        max16 |= clamp((at1_g*yy - at2_g*xy)*fg+0.5, 0, 63) << 5;
        max16 |= clamp((at1_b*yy - at2_b*xy)*frb+0.5, 0, 31);

        max16 = clamp((at1_r*xx - at2_r*xy)*frb+0.5, 0, 31) << 11;
        max16 |= clamp((at1_g*xx - at2_g*xy)*fg+0.5, 0, 63) << 5;
        max16 |= clamp((at1_b*xx - at2_b*xy)*frb+0.5, 0, 31);

        return {
            max16: max16,
            min16: min16,
            solved: (oldMin != min16 || oldMax != max16)
        }

    }

}


/**
 * 
 * @param {Uint8Array} block 
 * @param {number} refineCount 
 * @param {boolean} dither 
 */
function compress_color_block(block, refineCount, dither) {

    let mask = 0;
    let max16 = 0;
    let min16 = 0;


    // If constant color we can just skip compressing the block
    for(var i=0; i < 16; i++) {
        if(block[i] != block[i%4]) break;
    }

    if(i == 16) { // Constant color
        const col = block.slice(0, 3);
        mask = 0xaaaaaaaa;
        max16 = (oMatch5[col[0]*2] << 11) | (oMatch6[col[1]*2] << 5) | oMatch5[col[2]*2];
        min16 = (oMatch5[col[0]*2+1] << 11) | (oMatch6[col[1]*2+1] << 5) | oMatch5[col[2]*2+1];
    } else {
        let dblock = new Uint8Array(16*4);
        let color = new Uint8Array(4*4);

        const data = optimize_color_block(block);
        max16 = data.max16; min16 = data.min16;
        if(max16 != min16) {
            color = eval_colors(max16, min16);
            mask = match_colors_block(block, color);
        } else {
            mask = 0;
        }

        for(let i=0; i < refineCount; i++) {
            let lastmask = mask;

            const data = refine_block(block, max16, min16, mask);
            max16 = data.max16; min16 = data.min16;

            if(data.solved) {
                if(max16 != min16) {
                    eval_colors(max16, min16);
                    mask = match_colors_block(block, color);
                } else {
                    mask = 0;
                    break;
                }
            }


            if(mask == lastmask) break;
        }



    }

    if(max16 < min16) {
        const swap = min16;
        min16 = max16;
        max16 = swap;
        mask ^= 0x55555555;
    }

    


    return new Uint8Array([
        max16,
        max16 >> 8,
        min16,
        min16 >> 8,
        mask,
        mask >> 8,
        mask >> 16,
        mask >> 24
    ]);
}




function compress_block(block, alpha, refineCount, dither) {

    return compress_color_block(block, refineCount, dither);

}




/**
 * Converts ImageData to DXT1 (Compressed image, no alpha)
 * @param {ImageData} img 
 * @param {{stride: number, mode: number, alpha: boolean}}
 * @returns {Uint8Array}
 */
export function ImageData_To_DXT1(img, { stride=128, refineCount=2, dither=false, alpha=false } = {}) {

    const convert = new Uint8Array(Math.ceil((img.width * img.height) / 2));

    if(img.width < 16 || img.height < 16) {
        console.error(`Error while converting to DTX1\nImageData is too small! <16`);
        return convert;
    }
    
    if(img.width % 4 != 0 || img.height % 4 != 0) {
        console.error(`Error while converting to DTX1\nImageData width or height is not a multiple of 4!`);
        return convert;
    }

    let convertPos = 0;

    let block = new Uint8Array(64);
    for(let y=0; y < img.height; y += 4) {
        for(let x=0; x < img.width; x += 4) {
            const pos = (x + y * img.width) * 4;

            block.set(img.data.slice(pos, pos+16), 0);
            block.set(img.data.slice(pos+stride, pos+stride+16), 16);
            block.set(img.data.slice(pos+stride*2, pos+stride*2+16), 32);
            block.set(img.data.slice(pos+stride*3, pos+stride*3+16), 48);
            
            convert.set(compress_block(block, 0, refineCount), convertPos);

            convertPos += 8;
        }
    }

    return convert;

}
