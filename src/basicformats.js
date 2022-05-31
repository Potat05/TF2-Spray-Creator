
/*

    Basic format conversion

*/


import { lerp } from './useful.js';



/**
 * Converts ImageData to RGBA8888 (Full color, Full transparency)
 * @param {ImageData} img 
 * @returns {Uint8Array}
 */
export function ImageData_To_RGBA8888(img) {
    return img.data;
}

/**
 * Converts ImageData to RGB888 (Full color, no transparency)
 * @param {ImageData} img 
 * @param {number[]} alphaCol - Alpha converted to color
 * @returns {Uint8Array}
 */
export function ImageData_To_RGB888(img, alphaCol=[0, 0, 0]) {
    const convert = new Uint8Array(img.width * img.height * 3);
    for(let i=0; i < img.width * img.height; i++) {
        const transparency = (img.data[i*4+3] / 255) *-1 + 1;
        convert[i*3] = lerp(img.data[i*4], alphaCol[0], transparency);
        convert[i*3+1] = lerp(img.data[i*4+1], alphaCol[1], transparency);
        convert[i*3+2] = lerp(img.data[i*4+2], alphaCol[2], transparency);
    }
    return convert;
}

/**
 * Converts ImageData to RGB565 (Reduced color, no transparency)
 * @param {ImageData} img 
 * @returns {Uint8Array}
 */
export function ImageData_To_RGB565(img, alphaCol=[0, 0, 0]) {
    const convert = new Uint8Array(img.width * img.height * 2);
    for(let i=0; i < img.width * img.height; i++) {
        const transparency = (img.data[i*4+3] / 255) *-1 + 1;
        const g = Math.floor(lerp(img.data[i*4+1], alphaCol[1], transparency));
        convert[i*2] = ((g & 0b00011100) << 3) | (Math.floor(lerp(img.data[i*4], alphaCol[0], transparency)) >> 3);
        convert[i*2+1] = (Math.floor(lerp(img.data[i*4+2], alphaCol[2], transparency)) & 0b11111000) | (g >> 5);
    }
    return convert;
}

/**
 * Converts ImageData to I8 Image (Grayscale, full transparency)
 * @param {ImageData} img 
 * @param {Number[]} lum - Luminance muls for RGB
 * @returns {Uint8Array}
 */
export function ImageData_To_I8(img, lumVals=[0.2126, 0.7152, 0.0722]) {
    const convert = new Uint8Array(img.width * img.height);
    for(let i=0; i < convert.length; i++) {
        convert[i] = lumVals[0]*img.data[i*4] + lumVals[1]*img.data[i*4+1] + lumVals[2]*img.data[i*4+2];
    }
    return convert;
}

/**
 * Converts ImageData to IA88 Image (Grayscale with transparency)
 * @param {ImageData} img 
 * @param {Number[]} lum - Luminance muls for RGB
 * @returns {Uint8Array}
 */
export function ImageData_To_IA88(img, lumVals=[0.2126, 0.7152, 0.0722]) {
    const convert = new Uint8Array(img.width * img.height * 2);
    for(let i=0; i < img.width * img.height; i++) {
        convert[i*2] = lumVals[0]*img.data[i*4] + lumVals[1]*img.data[i*4+1] + lumVals[2]*img.data[i*4+2];
        convert[i*2+1] = img.data[i*4+3];
    }
    return convert;
}

/**
 * Converts ImageData to BGRA4444 (Reduced color, Unsmooth transparency)
 * @param {ImageData} img 
 * @returns {Uint8Array}
 */
 export function ImageData_To_BGRA4444(img) {
    const convert = new Uint8Array(img.width * img.height * 2);
    for(let i=0; i < img.width * img.height; i++) {
        convert[i*2] = (img.data[i*4+1] & 0b11110000) | (img.data[i*4+2] >> 4);
        convert[i*2+1] = (img.data[i*4+3] & 0b11110000) | (img.data[i*4] >> 4);
    }
    return convert;
}

/**
 * Converts ImageData to BGRA5551 (Reduced color, on/off transparency)
 * @param {ImageData} img 
 * @param {Number} transparentThreshold - Threshold for full transparency
 * @returns {Uint8Array}
 */
export function ImageData_To_BGRA5551(img, transparentThreshold=127) {
    const convert = new Uint8Array(img.width * img.height * 2);
    for(let i=0; i < img.width * img.height; i++) {
        const g = img.data[i*4+1];
        convert[i*2] = ((g << 2) & 0b11100000) | (img.data[i*4+2] >> 3);
        convert[i*2+1] = (img.data[i*4+3] >= transparentThreshold ? 0b10000000 : 0b00000000) | ((img.data[i*4] >> 1) & 0b01111100) | (g >> 6);
    }
    return convert;
}
