
/*

    Valve Texture File generator

    HUGE HELP ON MAKING THIS: https://developer.valvesoftware.com/wiki/Valve_Texture_Format

*/

import { loadImageData } from './useful.js';
import { Writer } from './writer.js';
import { ImageData_To_RGBA8888, ImageData_To_RGB888, ImageData_To_RGB565, ImageData_To_I8, ImageData_To_IA88, ImageData_To_BGRA4444, ImageData_To_BGRA5551 } from './basicformats.js';
import { ImageData_To_DXT1 } from './dxt1.js';
import { View_RGBA8888, View_RGB888, View_RGB565, View_I8, View_IA88, View_DXT1, View_BGRA4444, View_BGRA5551 } from './viewer.js';

const SIGNATURE = 0x00465456;
const VERSION = [7, 4]; // Max version TF2 can support

// Texture flags by bit index
const TEXTURE_FLAGS = {
    POINTSAMPLE: 0x00000001,
    TRILINEAR: 0x00000002,
    CLAMPS: 0x00000004,
    CLAMPT: 0x00000008,
    ANISOTROPIC: 0x00000010,
    HINT_DXT5: 0x00000020,
    PWL_CORRECTED: 0x00000040,
    NORMAL: 0x00000080,
    NOMIP: 0x00000100,
    NOLOD: 0x00000200,
    ALL_MIPS: 0x00000400,
    PROCEDURAL: 0x00000800,
    ONEBITALPHA: 0x00001000,
    EIGHTBITALPHA: 0x00002000,
    ENVMAP: 0x00004000,
    RENDERTARGET: 0x00008000,
    DEPTHRENDERTARGET: 0x00010000,
    NODEBUGOVERRIDE: 0x00020000,
    SINGLECOPY: 0x00040000,
    PRE_SRGB: 0x00080000,
    UNUSED_00100000: 0x00100000,
    UNUSED_00200000: 0x00200000,
    UNUSED_00400000: 0x00400000,
    NODEPTHBUFFER: 0x00800000,
    UNUSED_01000000: 0x01000000,
    CLAMPU: 0x02000000,
    VERTEXTEXTURE: 0x04000000,
    SSBUMP: 0x08000000,			
    UNUSED_10000000: 0x10000000,
    BORDER: 0x20000000,
    UNUSED_40000000: 0x40000000,
    UNUSED_80000000: 0x80000000,
}

export const IMAGE_FORMAT = {
    'NONE': { id: -1 },
    'RGBA8888': { id: 0, converter: ImageData_To_RGBA8888, viewer: View_RGBA8888, flags: TEXTURE_FLAGS.EIGHTBITALPHA, size: 32 },
    'ABGR8888': { id: 1 },
    'RGB888': { id: 2, converter: ImageData_To_RGB888, viewer: View_RGB888, flags: 0, size: 24 },
    'BGR888': { id: 3 },
    'RGB565': { id: 4, converter: ImageData_To_RGB565, viewer: View_RGB565, flags: 0, size: 16 },
    'I8': { id: 5, converter: ImageData_To_I8, viewer: View_I8, flags: 0, size: 8 },
    'IA88': { id: 6, converter: ImageData_To_IA88, viewer: View_IA88, flags: TEXTURE_FLAGS.EIGHTBITALPHA, size: 16 },
    'P8': { id: 7 },
    'A8': { id: 8 },
    'RGB888_BLUESCREEN': { id: 9 },
    'BGR888_BLUESCREEN': { id: 10 },
    'ARGB8888': { id: 11 },
    'BGRA8888': { id: 12 },
    'DXT1': { id: 13, converter: ImageData_To_DXT1, viewer: View_DXT1, flags: 0, size: 4 },
    'DXT3': { id: 14 },
    'DXT5': { id: 15 },
    'BGRX8888': { id: 16 },
    'BGR565': { id: 17 },
    'BGRX5551': { id: 18 },
    'BGRA4444': { id: 19, converter: ImageData_To_BGRA4444, viewer: View_BGRA4444, flags: 0, size: 16 },
    'DTX1_ONEBITALPHA': { id: 20 },
    'BGRA5551': { id: 21, converter: ImageData_To_BGRA5551, viewer: View_BGRA5551, flags: TEXTURE_FLAGS.ONEBITALPHA, size: 16 },
    'UV88': { id: 22 },
    'UVWQ8888': { id: 23 },
    'RGBA16161616F': { id: 24 },
    'RGBA16161616': { id: 25 },
    'UVLX8888': { id: 26 }
}

const RESOURCE_TAGS = {
    'LOWRES': [ 0x01, 0x00, 0x00 ],
    'HIGHRES': [ 0x30, 0x00, 0x00 ],
    'ANIMPARTICLESHEET': [ 0x10, 0x00, 0x00 ],
    'CRC': [ 0x43, 0x52, 0x43 ],
    'LODCONTROL': [ 0x4C, 0x4F, 0x44 ],
    'GAMEFLAGS': [ 0x54, 0x53, 0x4F ],
    'CUSTOM': [ 0x4B, 0x56, 0x44 ],
}

/**
 * Parse image(s) to a VTF file
 * 
 * There must be the same amount of frames for every mipmap!
 * First mipmap MUST have an image
 * If later mipmaps don't it will use the last image
 * @param {Image|Null[][]} images - Table of images ([mipmap][frames])
 * @param {{width: number, height: number, flags: number imageFormat: number|{ id: number, converter: function, flags: number, size: number }, autoMips: boolean, crc: boolean, downscaleAlias: boolean, generateThumbnail: boolean, views: HTMLCanvasElement}}
 * @returns {Uint8Array} - VTF file
 */
export function parseVTF(images=[], { width=512, height=512, flags=0, imageFormat=IMAGE_FORMAT.RGBA8888, autoMips=true, crc=true, downscaleAlias=true, generateThumbnail=true, views=[] } = {}) {

    // Alot of random checks.

    if(width % 4 != 0 || height % 4 != 0) {
        console.error(`Error while parsing VTF\nImage width and height must be a multiple of 4!`);
        return null;
    }

    // Check if no images
    if(images.length == 0) {
        console.error(`Error while parsing VTF\nNo images provided!`);
        return null;
    }

    // Check if no images in first
    for(let i in images[0]) {
        if(!images[0][i]) {
            console.error(`Error while parsing VTF\nFirst images cannot be undefined!`);
            return null;
        }
    }

    // Add frame array
    for(let i in images) {
        if(images[i] instanceof Image) images[i] = [images[i]];
    }

    // Get mipmap & frame count
    let mipmapCount = images.length;
    if(autoMips) {
        // Increase mipmap count until it hits the min size
        mipmapCount = 1;
        while((width/2**mipmapCount > 4) && (height/2**mipmapCount > 4)) mipmapCount++;
    }
    const frameCount = images[0].length;

    // Check if each mipmap has same number of frames
    if(images.every(mip => mip.length != frameCount)) {
        console.error(`Error while parsing VTF\nFrame count for every mipmap isn't the same!`);
        return null;
    }

    // Set image format
    if(typeof imageFormat == 'number') {
        for(let i in IMAGE_FORMAT) {
            if(IMAGE_FORMAT[i].id != imageFormat) continue;
            imageFormat = IMAGE_FORMAT[i];
        }
    }

    // Image format has no converter
    if(!imageFormat.converter) {
        console.error(`Error while parsing VTF\nImage format ${imageFormat.id} doesn't have a converter!`);
        return null;
    }






    // Actual parsing

    const wr = new Writer();

    // Estimate size for faster writing
    let mipsSize = 0;
    for(let i=0; i < mipmapCount; i++) mipsSize += (width / 2**i) * (height / 2**i) * (imageFormat.size / 8);
    wr.extend(96 + mipsSize + 1024); // header size + mips size + some padding

    // Write a resource
    let resource_count = 0;
    let resource_index = 0;
    function write_resource(tag=RESOURCE_TAGS.CUSTOM, flags=0x00) {
        wr.write_bytes(tag);
        wr.write_byte(flags);
        const index = wr.pointer;
        wr.write_int(0);
        resource_count++;
        return (offset=wr.pointer) => {
            wr.set_int(index, offset);
        }
    }

    // Header data
    wr.write_int(SIGNATURE); // Signature
    wr.write_int(VERSION[0]); wr.write_int(VERSION[1]); // Version
    const header_size_index = wr.pointer;
    wr.write_int(0); // Header size (Always 80 for TF2)
    wr.write_short(width); // Width
    wr.write_short(height); // Height
    // Flags
    wr.write_int(flags | imageFormat.flags | (mipmapCount == 1 ? TEXTURE_FLAGS.NOMIP | TEXTURE_FLAGS.NOLOD : 0));
    wr.write_short(frameCount); // Num frames
    wr.write_short(0); // First frame
    wr.write_bytes([0, 0, 0, 0]); // Padding
    wr.write_bytes([0,0,128,63, 0,0,128,63, 0,0,128,63]); // Reflectivity
    wr.write_bytes([0, 0, 0, 0]); // Padding
    wr.write_bytes([0, 0, 128, 63]); // Bumpmap scale
    wr.write_int(imageFormat.id); // High res image format
    wr.write_byte(mipmapCount); // Mipmap count
    wr.write_int(IMAGE_FORMAT.DXT1.id); // Low res image format
    wr.write_byte(16); // Low res width
    wr.write_byte(16); // Low res height
    wr.write_short(1); // Depth
    wr.write_bytes([0, 0, 0]);  // Padding
    resource_index = wr.pointer;
    wr.write_int(0); // Number of resources (max 32) (Unset for now)
    wr.write_bytes([0, 0, 0, 0, 0, 0, 0, 0]); // Padding

    // Resources dictionairy
    const resource_highres = write_resource(RESOURCE_TAGS.HIGHRES);
    if(crc) var resource_crc = write_resource(RESOURCE_TAGS.CRC, 0x02);
    if(generateThumbnail) var resource_thumbnail = write_resource(RESOURCE_TAGS.LOWRES)

    // Set count resource byte
    wr.set_int(resource_index, resource_count);
    
    // Set header size
    wr.set_int(header_size_index, wr.length);

    const header_end = wr.pointer;

    // Write thumbnail
    if(generateThumbnail) {
        resource_thumbnail();
        const imageData = loadImageData(images[0][0], 16, 16, true);
        wr.write_bytes(IMAGE_FORMAT.DXT1.converter(imageData));
    }
    

    // Write all bitmaps
    resource_highres();
    for(let i=mipmapCount-1; i >= 0; i--) {
        const mipWidth = width / 2**i;
        const mipHeight = height / 2**i;
        for(let j=0; j < frameCount; j++) {
            let imageData;
            if(!images[i] || !images[i][j]) {
                let img = null;
                for(let k=i; i >= 0; k--) {
                    if(images[k] && images[k][j]) {
                        img = images[k][j];
                        break;
                    }
                }
                imageData = loadImageData(img, mipWidth, mipHeight, downscaleAlias);
            } else {
                imageData = loadImageData(images[i][j], mipWidth, mipHeight, downscaleAlias);
            }
            const convert = imageFormat.converter(imageData);
            wr.write_bytes(convert);
            if(views[i] && j == 0) {
                imageFormat.viewer(views[i], imageData.width, imageData.height, convert);
            }
        }
    }

    // CRC Resource
    if(crc) resource_crc(wr.crc32(header_end));

    // Return data
    return wr.get();

}