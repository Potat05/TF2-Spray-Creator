

/*

    To view image formats

*/


/**
 * Draw RGBA8888 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_RGBA8888(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    img.data.set(data);

    ctx.putImageData(img, 0, 0);

}

/**
 * Draw RGB888 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_RGB888(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = data[i*3];
        img.data[i*4+1] = data[i*3+1];
        img.data[i*4+2] = data[i*3+2];
        img.data[i*4+3] = 255;
    }

    ctx.putImageData(img, 0, 0);

}

/**
 * Draw RGB565 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_RGB565(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = (data[i*2] & 0b00011111) << 3;
        img.data[i*4+1] = ((data[i*2] & 0b11100000) >> 3) | ((data[i*2+1] & 0b00000111) << 5);
        img.data[i*4+2] = data[i*2+1] & 0b11111000;
        img.data[i*4+3] = 255;
    }

    ctx.putImageData(img, 0, 0);

}

/**
 * Draw I8 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_I8(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = data[i];
        img.data[i*4+1] = data[i];
        img.data[i*4+2] = data[i];
        img.data[i*4+3] = 255;
    }

    ctx.putImageData(img, 0, 0);

}

/**
 * Draw IA88 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_IA88(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = data[i*2];
        img.data[i*4+1] = data[i*2];
        img.data[i*4+2] = data[i*2];
        img.data[i*4+3] = data[i*2+1];
    }

    ctx.putImageData(img, 0, 0);

}

/**
 * Converts RGB565 value to RGBA8888 array
 * @param {number} v 
 * @returns {Uint8Array}
 */
function from16bit(v) {
    return new Uint8Array([
        (((v & 0xF800) >> 11) * 33) >> 2,
        (((v & 0x07E0) >> 5) * 65) >> 4,
        (((v & 0x001F) >> 0) * 33) >> 2,
        0
    ]);
}

/**
 * 2/3 of A + 1/3 of B
 * @param {number} a 
 * @param {number} b 
 * @returns {number}
 */
function lerp13(a, b) {
    return (2*a + b) / 3;
}

/**
 * 2/3 of A + 1/3 of B
 * @param {Uint8Array} p1 
 * @param {Uint8Array} p2 
 * @returns {Uint8Array}
 */
function lerp13rgb(p1, p2) {
    return new Uint8Array([
        lerp13(p1[0], p2[0]),
        lerp13(p1[1], p2[1]),
        lerp13(p1[2], p2[2]),
        0
    ]);
}

/**
 * Draw DXT1 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_DXT1(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let y=0; y < height; y += 4) {
        for(let x=0; x < width; x += 4) {

            const offset = (x + y*width/4) * 2;

            const col1 = from16bit((data[offset+1] << 8) | data[offset+0]);
            const col2 = from16bit((data[offset+3] << 8) | data[offset+2]);
            const colors = [
                col1,
                col2,
                lerp13rgb(col1, col2),
                lerp13rgb(col2, col1)
            ];

            for(let dx=0; dx < 4; dx++) {
                for(let dy=0; dy < 4; dy++) {
                    const ind = (x+dx + (y+dy) * width) * 4;

                    const col = colors[((data[offset + dy + 4]) >> dx*2) & 0b00000011];

                    img.data[ind] = col[0];
                    img.data[ind+1] = col[1];
                    img.data[ind+2] = col[2];
                    img.data[ind+3] = 255;
                }
            }
        }
    }

    ctx.putImageData(img, 0, 0);

}

/**
 * Draw BGRA4444 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
export function View_BGRA4444(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = (data[i*2+1] & 0b00001111) << 4;
        img.data[i*4+1] = (data[i*2] & 0b11110000);
        img.data[i*4+2] = (data[i*2] & 0b00001111) << 4;;
        img.data[i*4+3] = (data[i*2+1] & 0b11110000);
    }

    ctx.putImageData(img, 0, 0);

}


/**
 * Draw BGRA5551 onto canvas
 * @param {HTMLCanvasElement} canvas 
 * @param {number} width 
 * @param {number} height 
 * @param {Uint8Array} data 
 */
 export function View_BGRA5551(canvas, width, height, data) {

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, width, height);

    const img = ctx.createImageData(width, height);

    for(let i=0; i < width*height; i++) {
        img.data[i*4] = (data[i*2+1] & 0b01111100) << 1;
        img.data[i*4+1] = ((data[i*2] & 0b11100000) >> 2) | ((data[i*2+1] & 0b00000011) << 6);
        img.data[i*4+2] = (data[i*2] & 0b00011111) << 3;
        img.data[i*4+3] = (data[i*2+1] & 0b10000000) ? 255 : 0;
    }

    ctx.putImageData(img, 0, 0);

}
