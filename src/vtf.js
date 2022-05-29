
import { loadImageDataFromFile } from './useful.js';
import { Writer } from './writer.js';

export class VTF {
    
    /** @type {Number} */
    size = 1024;

    /** @type {ImageData[]} Each mipmap is 1/4th of parent down to 32x32 */
    mipmaps = [];
    /** @type {ImageData} LowRes/Thumbnail that does not exceed 16x16 */
    lowres = null;

    clear() {
        this.size = 1024;
        this.mipmaps = [];
        this.lowres = null;
    }

    async setImage(file, mips=true) {
        this.clear();
        this.mipmaps.push(await loadImageDataFromFile(file, this.size));
        if(mips) {
            let size = this.size;
            while(size > 32) {
                size /= 2;
                this.mipmaps.push(await loadImageDataFromFile(file, size))
            }
        }
        this.lowres = await loadImageDataFromFile(file, 16);
    }

}


/**
 * Parse VTF object to file
 * @param {VTF} vtf 
 * @param {Object} options 
 * @returns {Uint8Array}
 */
export function parseVTF(vtf, options={}) {

    const SIGNATURE = 0x00465456;
    const HEADER_SIZE = 80;

    const IMAGE_FORMAT_NONE = -1;
    const IMAGE_FORMAT = [
        'RGBA8888',
        'ABGR8888',
        'RGB888',
        'BGR888',
        'RGB565',
        'I8',
        'IA88',
        'P8',
        'A8',
        'RGB888_BLUESCREEN',
        'BGR888_BLUESCREEN',
        'ARGB8888',
        'BGRA8888',
        'DXT1',
        'DXT3',
        'DXT5',
        'BGRX8888',
        'BGR565',
        'BGRX5551',
        'BGRA4444',
        'DTX1_ONEBITALPHA',
        'BGRA5551',
        'UV88',
        'UVWQ8888',
        'RGBA16161616F',
        'RGBA16161616',
        'UVLX8888'
    ]

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
    };


    options = Object.assign(options, {
        version: [7, 2]
    });

    const wr = new Writer();

    // Header data
    wr.write_int(SIGNATURE); // Signature
    wr.write_int(options.version[0]); wr.write_int(options.version[1]); // Version
    wr.write_int(64); // Header size (Always 80 for TF2)
    wr.write_short(vtf.size); // Width
    wr.write_short(vtf.size); // Height
    wr.write_int(TEXTURE_FLAGS.NOMIP | TEXTURE_FLAGS.NOLOD | TEXTURE_FLAGS.EIGHTBITALPHA); // Flags
    wr.write_short(1); // Num frames
    wr.write_short(0); // First frame
    wr.write_bytes([0,0,0,0, 0,0,128,63, 0,0,128,63, 0,0,128,63, 0,0,0,0]); // Reflectivity
    wr.write_bytes([0, 0, 128, 63]); // Bumpmap scale
    wr.write_int(0); // High res image format
    wr.write_byte(vtf.mipmaps.length); // Mipmap count

    // Skip low res image
    wr.write_bytes([255, 255, 255, 255]);
    wr.write_byte(0);
    wr.write_byte(0);

    // I have no clue what this byte does.
    wr.write_byte(1);

    // // Low res image
    // wr.write_int(0);
    // // wr.write_int(13); // Low res image format (Always DXT1)
    // wr.write_byte(0); // Low res image width
    // wr.write_byte(0); // Low res image height


    // Write all bitmaps
    for(let img of vtf.mipmaps) {
        wr.write_bytes(img.data);
    }

    // Return data
    return wr.get();

}