
import { awaitLoadImage, loadImageData } from './useful.js';
import { Writer } from './writer.js';

export class VTF {
    
    /** @type {Number} */
    size = 256;

    /** @type {ImageData[][]} Each mipmap is 1/4th of parent down to 32x32 */
    mipmaps = [];

    mipmap_count = 0;
    frame_count = 0;

    clear() {
        this.size = 256;
        this.mipmaps = [];
        this.mipmap_count = 0;
        this.frame_count = 0;
    }

    /**
     * 
     * @param {File} file 
     * @param {Boolean} mips 
     */
    async setImage(file, mips=true) {
        this.clear();

        if(file.type == 'image/gif') {
            console.warn('Gifs currently not supported!');
        } else {
            const img = await awaitLoadImage(file);

            this.mipmap_count = 1;
            this.frame_count = 1;
            this.mipmaps.push([loadImageData(img, this.size)]);
    
            if(mips) {
                let size = this.size;
                while(size > 32) {
                    size /= 2;
                    this.mipmap_count++;
                    this.mipmaps.push([loadImageData(img, size)]);
                }
            }
        }
        
    }

}




const SIGNATURE = 0x00465456;
const VERSION = [7, 4]; // Max version TF2 can support
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
 * Parse VTF object to file
 * @param {VTF} vtf 
 * @param {Object} options 
 * @returns {Uint8Array}
 */
export function parseVTF(vtf) {

    const wr = new Writer();

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
    wr.write_short(vtf.size); // Width
    wr.write_short(vtf.size); // Height
    // Flags
    if(vtf.mipmaps.length > 1) wr.write_int(TEXTURE_FLAGS.EIGHTBITALPHA);
    else wr.write_int(TEXTURE_FLAGS.NOMIP | TEXTURE_FLAGS.NOLOD | TEXTURE_FLAGS.EIGHTBITALPHA);

    wr.write_short(vtf.frame_count); // Num frames
    wr.write_short(0); // First frame
    wr.write_bytes([0, 0, 0, 0]); // Padding
    wr.write_bytes([0,0,128,63, 0,0,128,63, 0,0,128,63]); // Reflectivity
    wr.write_bytes([0, 0, 0, 0]); // Padding
    wr.write_bytes([0, 0, 128, 63]); // Bumpmap scale
    wr.write_int(0); // High res image format
    wr.write_byte(vtf.mipmap_count); // Mipmap count
    wr.write_int(0xFFFFFFFF); // Low res image format
    wr.write_byte(0); // Low res width
    wr.write_byte(0); // Low res height
    wr.write_short(1); // Depth
    wr.write_bytes([0, 0, 0]);  // Padding
    resource_index = wr.pointer;
    wr.write_int(0); // Number of resources (max 32) (Unset for now)
    wr.write_bytes([0, 0, 0, 0, 0, 0, 0, 0]); // Padding

    // Resources dictionairy
    const resource_highres = write_resource(RESOURCE_TAGS.HIGHRES);
    const resource_crc = write_resource(RESOURCE_TAGS.CRC, 0x02);

    // Set count resource byte
    wr.set_int(resource_index, resource_count);
    
    // Set header size
    wr.set_int(header_size_index, wr.length);

    const header_end = wr.pointer;

    // Write all bitmaps
    resource_highres();
    vtf.mipmaps.reverse().forEach(frames => {
        frames.forEach(img => {
            wr.write_bytes(img.data);
        });
    });

    // CRC Resource
    resource_crc(wr.crc32(header_end));

    // Return data
    return wr.get();

}