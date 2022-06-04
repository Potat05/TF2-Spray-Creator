
/*

    Basically just a port of: 
    https://github.com/nothings/stb/blob/master/stb_dxt.h

*/

const OMatch5 = new Uint8Array([
    0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 2, 0, 4, 2, 1, 2, 1, 2, 1, 2, 2, 
    2, 2, 2, 2, 2, 3, 1, 5, 3, 2, 3, 2, 4, 0, 3, 3, 3, 3, 3, 3, 3, 4, 3, 4, 3, 4, 3, 5, 4, 3, 4, 3, 
    5, 2, 4, 4, 4, 4, 4, 5, 4, 5, 5, 4, 5, 4, 5, 4, 6, 3, 5, 5, 5, 5, 5, 6, 4, 8, 6, 5, 6, 5, 6, 5, 
    6, 6, 6, 6, 6, 6, 6, 7, 5, 9, 7, 6, 7, 6, 8, 4, 7, 7, 7, 7, 7, 7, 7, 8, 7, 8, 7, 8, 7, 9, 8, 7, 
    8, 7, 9, 6, 8, 8, 8, 8, 8, 9, 8, 9, 9, 8, 9, 8, 9, 8, 10, 7, 9, 9, 9, 9, 9, 10, 8, 12, 10, 9, 10, 9, 
    10, 9, 10, 10, 10, 10, 10, 10, 10, 11, 9, 13, 11, 10, 11, 10, 12, 8, 11, 11, 11, 11, 11, 11, 11, 12, 11, 12, 11, 12, 11, 13, 
    12, 11, 12, 11, 13, 10, 12, 12, 12, 12, 12, 13, 12, 13, 13, 12, 13, 12, 13, 12, 14, 11, 13, 13, 13, 13, 13, 14, 12, 16, 14, 13, 
    14, 13, 14, 13, 14, 14, 14, 14, 14, 14, 14, 15, 13, 17, 15, 14, 15, 14, 16, 12, 15, 15, 15, 15, 15, 15, 15, 16, 15, 16, 15, 16, 
    15, 17, 16, 15, 16, 15, 17, 14, 16, 16, 16, 16, 16, 17, 16, 17, 17, 16, 17, 16, 17, 16, 18, 15, 17, 17, 17, 17, 17, 18, 16, 20, 
    18, 17, 18, 17, 18, 17, 18, 18, 18, 18, 18, 18, 18, 19, 17, 21, 19, 18, 19, 18, 20, 16, 19, 19, 19, 19, 19, 19, 19, 20, 19, 20, 
    19, 20, 19, 21, 20, 19, 20, 19, 21, 18, 20, 20, 20, 20, 20, 21, 20, 21, 21, 20, 21, 20, 21, 20, 22, 19, 21, 21, 21, 21, 21, 22, 
    20, 24, 22, 21, 22, 21, 22, 21, 22, 22, 22, 22, 22, 22, 22, 23, 21, 25, 23, 22, 23, 22, 24, 20, 23, 23, 23, 23, 23, 23, 23, 24, 
    23, 24, 23, 24, 23, 25, 24, 23, 24, 23, 25, 22, 24, 24, 24, 24, 24, 25, 24, 25, 25, 24, 25, 24, 25, 24, 26, 23, 25, 25, 25, 25, 
    25, 26, 24, 28, 26, 25, 26, 25, 26, 25, 26, 26, 26, 26, 26, 26, 26, 27, 25, 29, 27, 26, 27, 26, 28, 24, 27, 27, 27, 27, 27, 27, 
    27, 28, 27, 28, 27, 28, 27, 29, 28, 27, 28, 27, 29, 26, 28, 28, 28, 28, 28, 29, 28, 29, 29, 28, 29, 28, 29, 28, 30, 27, 29, 29, 
    29, 29, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 30, 30, 30, 30, 30, 30, 31, 30, 31, 31, 30, 31, 30, 31, 30, 31, 31, 31, 31, 
]);
const OMatch6 = new Uint8Array([
    0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 2, 2, 1, 2, 2, 2, 2, 2, 3, 3, 2, 3, 3, 3, 3, 3, 4, 4, 3, 4, 4, 
    4, 4, 4, 5, 5, 4, 5, 5, 5, 5, 5, 6, 6, 5, 6, 6, 6, 6, 6, 7, 7, 6, 7, 7, 7, 7, 7, 8, 8, 7, 8, 8, 
    8, 8, 8, 9, 9, 8, 9, 9, 9, 9, 9, 10, 10, 9, 10, 10, 10, 10, 10, 11, 11, 10, 8, 16, 11, 11, 11, 12, 12, 11, 9, 17, 
    12, 12, 12, 13, 13, 12, 11, 16, 13, 13, 13, 14, 14, 13, 12, 17, 14, 14, 14, 15, 15, 14, 14, 16, 15, 15, 15, 16, 16, 14, 16, 15, 
    17, 14, 16, 16, 16, 17, 17, 16, 18, 15, 17, 17, 17, 18, 18, 17, 20, 14, 18, 18, 18, 19, 19, 18, 21, 15, 19, 19, 19, 20, 20, 19, 
    20, 20, 20, 20, 20, 21, 21, 20, 21, 21, 21, 21, 21, 22, 22, 21, 22, 22, 22, 22, 22, 23, 23, 22, 23, 23, 23, 23, 23, 24, 24, 23, 
    24, 24, 24, 24, 24, 25, 25, 24, 25, 25, 25, 25, 25, 26, 26, 25, 26, 26, 26, 26, 26, 27, 27, 26, 24, 32, 27, 27, 27, 28, 28, 27, 
    25, 33, 28, 28, 28, 29, 29, 28, 27, 32, 29, 29, 29, 30, 30, 29, 28, 33, 30, 30, 30, 31, 31, 30, 30, 32, 31, 31, 31, 32, 32, 30, 
    32, 31, 33, 30, 32, 32, 32, 33, 33, 32, 34, 31, 33, 33, 33, 34, 34, 33, 36, 30, 34, 34, 34, 35, 35, 34, 37, 31, 35, 35, 35, 36, 
    36, 35, 36, 36, 36, 36, 36, 37, 37, 36, 37, 37, 37, 37, 37, 38, 38, 37, 38, 38, 38, 38, 38, 39, 39, 38, 39, 39, 39, 39, 39, 40, 
    40, 39, 40, 40, 40, 40, 40, 41, 41, 40, 41, 41, 41, 41, 41, 42, 42, 41, 42, 42, 42, 42, 42, 43, 43, 42, 40, 48, 43, 43, 43, 44, 
    44, 43, 41, 49, 44, 44, 44, 45, 45, 44, 43, 48, 45, 45, 45, 46, 46, 45, 44, 49, 46, 46, 46, 47, 47, 46, 46, 48, 47, 47, 47, 48, 
    48, 46, 48, 47, 49, 46, 48, 48, 48, 49, 49, 48, 50, 47, 49, 49, 49, 50, 50, 49, 52, 46, 50, 50, 50, 51, 51, 50, 53, 47, 51, 51, 
    51, 52, 52, 51, 52, 52, 52, 52, 52, 53, 53, 52, 53, 53, 53, 53, 53, 54, 54, 53, 54, 54, 54, 54, 54, 55, 55, 54, 55, 55, 55, 55, 
    55, 56, 56, 55, 56, 56, 56, 56, 56, 57, 57, 56, 57, 57, 57, 57, 57, 58, 58, 57, 58, 58, 58, 58, 58, 59, 59, 58, 59, 59, 59, 59, 
    59, 60, 60, 59, 60, 60, 60, 60, 60, 61, 61, 60, 61, 61, 61, 61,  61, 62, 62, 61, 62, 62, 62, 62, 62, 63, 63, 62, 63, 63, 63, 63, 
]);

const midpoints5 = new Float32Array([
    0.015686, 0.047059, 0.078431, 0.111765, 0.145098, 0.176471, 0.207843, 0.241176, 0.274510, 0.305882, 0.337255, 0.370588, 0.403922, 0.435294, 0.466667, 0.500000,
    0.533333, 0.564706, 0.596078, 0.629412, 0.662745, 0.694118, 0.725490, 0.758824, 0.792157, 0.823529, 0.854902, 0.888235, 0.921569, 0.952941, 0.984314, 1.000000
]);
const midpoints6 = new Float32Array([
    0.007843, 0.023529, 0.039216, 0.054902, 0.070588, 0.086275, 0.101961, 0.117647, 0.133333, 0.149020, 0.164706, 0.180392, 0.196078, 0.211765, 0.227451, 0.245098,
    0.262745, 0.278431, 0.294118, 0.309804, 0.325490, 0.341176, 0.356863, 0.372549, 0.388235, 0.403922, 0.419608, 0.435294, 0.450980, 0.466667, 0.482353, 0.500000,
    0.517647, 0.533333, 0.549020, 0.564706, 0.580392, 0.596078, 0.611765, 0.627451, 0.643137, 0.658824, 0.674510, 0.690196, 0.705882, 0.721569, 0.737255, 0.754902,
    0.772549, 0.788235, 0.803922, 0.819608, 0.835294, 0.850980, 0.866667, 0.882353, 0.898039, 0.913725, 0.929412, 0.945098, 0.960784, 0.976471, 0.992157, 1.000000
]);




function mul8bit(a, b) {
    const t = a*b + 128;
    return t + (t >> 8) >> 8;
}
 
function from16bit(v) {
    return new Uint8Array([
        (((v & 0xF800) >> 11) * 33) >> 2,
        (((v & 0x07E0) >> 5) * 65) >> 4,
        (((v & 0x001F) >> 0) * 33) >> 2,
        0
    ]);
}

function as16bit(r, g, b) {
    return (mul8bit(r, 31) << 11) + (mul8bit(g, 63) << 5) + (mul8bit(b, 31));
}

function lerp13(a, b) {
    // return a + mul8bit(b-a, 0x55);
    return (2*a + b) / 3;
}

function lerp13rgb(p1, p2) {
    return new Uint8Array([
        lerp13(p1[0], p2[0]),
        lerp13(p1[1], p2[1]),
        lerp13(p1[2], p2[2]),
        0
    ]);
}

function evalColors(c0, c1) {
    const d0 = from16bit(c0);
    const d1 = from16bit(c1);
    const l0 = lerp13rgb(d0, d1);
    const l1 = lerp13rgb(d1, d0);
    return new Uint8Array([
        d0[0], d0[1], d0[2], d0[3],
        d1[0], d1[1], d1[2], d1[3],
        l0[0], l0[1], l0[2], l0[3],
        l1[0], l1[1], l1[2], l1[3],
    ]);
}

function quantize5(x) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    let q = (x * 31);
    q += (x > midpoints5[q]);
    return q;
}

function quantize6(x) {
    x = x < 0 ? 0 : x > 1 ? 1 : x;
    let q = (x * 63);
    q += (x > midpoints6[q]);
    return q;
}



function matchColorsBlock(block, color) {
    let mask = 0x00000000;
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

    const c0Point = (stops[1] + stops[3]);
    const halfPoint = (stops[3] + stops[2]);
    const c3Point = (stops[2] + stops[0]);

    for(let i=15; i >= 0; i--) {
        const dot = dots[i]*2;
        mask <<= 2;

        if(dot < halfPoint) {
            mask |= (dot < c0Point) ? 1 : 3;
        } else {
            mask |= (dot < c3Point) ? 2 : 0;
        }
    }

    return mask;
}

function optimizeColorsBlock(block, iterPower=4) {

    // Get min/max/total for each channel
    let mu = new Uint32Array(3);
    let min = new Uint32Array(3);
    let max = new Uint32Array(3);
    for(let ch=0; ch < 3; ch++) {
        let muv = block[ch]; let minv = block[ch]; let maxv = block[ch];
        
        for(let i=4; i < 64; i+=4) {
            muv += block[ch+i];
            if(block[ch+i] < minv) minv = block[ch+i];
            else if(block[ch+i] > maxv) maxv = block[ch+i];
        }

        mu[ch] = (muv + 8) >> 4;
        min[ch] = minv;
        max[ch] = maxv;
    }


    let cov = new Float64Array(6);

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

    for(let i=0; i < 6; i++) {
        cov[i] /= 255;
    }

    let vfr = (max[0] - min[0]);
    let vfg = (max[1] - min[1]);
    let vfb = (max[2] - min[2]);

    for(let iter=0; iter < iterPower; iter++) {
        const r = vfr*cov[0] + vfg*cov[1] + vfb*cov[2];
        const g = vfr*cov[1] + vfg*cov[3] + vfb*cov[4];
        const b = vfr*cov[2] + vfg*cov[4] + vfb*cov[5];

        vfr = r;
        vfg = g;
        vfb = b;
    }

    let magn = Math.max(Math.abs(vfr), Math.abs(vfg), Math.abs(vfb));

    let v_r = 0; let v_g = 0; let v_b = 0;
    if(magn < 4) {
        v_r = 299;
        v_g = 587;
        v_b = 114;
    } else {
        magn = 512 / magn;
        v_r = (vfr * magn);
        v_g = (vfg * magn);
        v_b = (vfb * magn);
    }

    let minp = 0;
    let maxp = 0;
    let mind = block[0]*v_r + block[1]*v_g + block[2]*v_b;
    let maxd = mind;
    for(let i=1; i < 16; i++) {
        const dot = block[i*4]*v_r + block[i*4+1]*v_g + block[i*4+2]*v_b;

        if(dot < mind) {
            mind = dot;
            minp = i*4;
        }
        if(dot > maxd) {
            maxd = dot;
            maxp = i*4;
        }
    }

    return {
        pmax: as16bit(block[maxp], block[maxp+1], block[maxp+2]),
        pmin: as16bit(block[minp], block[minp+1], block[minp+2])
    }

}

// This is broken!
function refineBlock(block, oldMax, oldMin, mask) {

    let max = 0x00000000; let min = 0x00000000;

    if((mask ^ (mask << 2)) < 4) {
        let r = 8; let b = 8; let g = 8;

        for(let i=0; i < 16; i++) {
            r += block[i*4];
            g += block[i*4+1];
            b += block[i*4+2];
        }

        r >>= 4; g >>= 4; b >>= 4;

        max = (OMatch5[r*2] << 11) | (OMatch6[g*2] << 5) | OMatch5[b*2];
        min = (OMatch5[r*2+1] << 11) | (OMatch6[g*2+1] << 5) | OMatch5[b*2+1];
    } else {
        let at1_r = 0; let at1_g = 0; let at1_b = 0;
        let at2_r = 0; let at2_g = 0; let at2_b = 0;
        let cm = mask;
        let akku = 0;
        const w1Tab = new Uint8Array([3, 0, 2, 1]);
        const prods = new Uint32Array([0x090000, 0x000900, 0x040102, 0x010402]);
        for(let i=0; i < 16; i++, cm >>= 2) {
            const step = cm & 0b00000011;
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

        const f = 3 / 255 / (xx*yy - xy*xy);
        
        max = quantize5((at1_r*yy - at2_r*xy) * f) << 11;
        max |= quantize6((at1_g*yy - at2_g*xy) * f) << 5;
        max |= quantize5((at1_b*yy - at2_b*xy) * f) << 0;
        
        min = quantize5((at2_r*xx - at1_r*xy) * f) << 11;
        min |= quantize6((at2_g*xx - at1_g*xy) * f) << 5;
        min |= quantize5((at2_b*xx - at1_b*xy) * f) << 0;
    }

    return {
        max: max,
        min: min,
        solved: oldMin != min || oldMax != max
    }
}

function compressColorBlock(block, refineCount=2, iterPower) {

    let mask = 0x00000000;

    let max = 0; let min = 0;

    let i;
    for(let i=1; i < 16; i++) {
        if(block[i] != block[0]) break;
    }

    if(i == 16) {
        const r = block[0]; const g = block[1]; const b = block[2];
        mask = 0xaaaaaaaa;
        max = (OMatch5[r*2] << 11) | (OMatch6[g*2] << 5) | OMatch5[b*2];
        min = (OMatch5[r*2+1] << 11) | (OMatch6[g*2+1] << 5) | OMatch5[b*2+1];
    } else {
        const data = optimizeColorsBlock(block, iterPower);
        max = data.pmax;
        min = data.pmin;

        let color = new Uint8Array(16);
        if(max != min) {
            color = evalColors(max, min);
            mask = matchColorsBlock(block, color);
        } else {
            mask = 0;
        }

        for(let i=0; i < refineCount; i++) {
            let lastMask = mask;

            const rdata = refineBlock(block, max, min, mask);
            max = rdata.max;
            min = rdata.min;
            if(rdata.solved) {
                if(max != min) {
                    color = evalColors(max, min);
                    mask = matchColorsBlock(block, color);
                } else {
                    mask = 0;
                    break;
                }
            }

            if(mask == lastMask) break;
        }

    }

    if(max < min) {
        const swap = min;
        min = max;
        max = swap;
        mask ^= 0x55555555;
    }

    return new Uint8Array([
        max,
        max >> 8,
        min,
        min >> 8,
        mask,
        mask >> 8,
        mask >> 16,
        mask >> 24
    ]);

}





/**
 * Converts ImageData to DXT1 (Compressed image, no alpha)
 * @param {ImageData} img 
 * @param {{refineCount: number, dither: boolean, alpha: boolean}}
 * @returns {Uint8Array}
 */
export function ImageData_To_DXT1(img, { refineCount=0, iterPower=0, dither=false, alpha=false } = {}) {

    const convert = new Uint8Array(Math.ceil((img.width * img.height) / 2));

    if(img.width % 4 != 0 || img.height % 4 != 0) {
        console.error(`Error while converting to DTX1\nImageData width or height is not a multiple of 4!`);
        return convert;
    }

    
    const stride = img.width * 4;
    
    let convertPos = 0;
    let block = new Uint8Array(64);
    for(let y=0; y < img.height; y += 4) {
        for(let x=0; x < img.width; x += 4) {
            const pos = (x + y * img.width) * 4;

            block.set(img.data.slice(pos, pos+16), 0);
            block.set(img.data.slice(pos+stride, pos+stride+16), 16);
            block.set(img.data.slice(pos+stride*2, pos+stride*2+16), 32);
            block.set(img.data.slice(pos+stride*3, pos+stride*3+16), 48);
            
            const comp = compressColorBlock(block, refineCount, iterPower);
            convert.set(comp, convertPos);

            convertPos += 8;
        }
    }

    return convert;

}

