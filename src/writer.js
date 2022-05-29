
// This probably isn't the best way to do this. But oh well I can't find any other easy way.

// Allocate a MB
const DEFAULT_EXTEND_LENGTH = 1e+6;

// Generate CRC Table
const CRC_TABLE = new Uint32Array(256);
for(let i=0; i < 256; i++) {
    let c = i;
    for(let j=0; j < 8; j++) {
        c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    CRC_TABLE[i] = c;
}

export class Writer {
    
    length = 0;
    data = new Uint8Array(this.length);
    pointer = 0;
    extend(extend=DEFAULT_EXTEND_LENGTH) {
        const newData = new Uint8Array(this.data.length + extend);
        this.data.forEach((val, ind) => newData[ind] = val);
        this.data = newData;
    }

    get() {
        return new Uint8Array(this.length).map((val, ind) => this.data[ind]);
    }

    push(data=0) {
        this.length++;
        if(this.length >= this.data.length) this.extend();
        return this.data[this.pointer++] = data;
    }

    pop() {
        return this.data[this.pointer--] = 0;
    }





    write_byte(byte=0) {
        this.push(byte);
    }
    write_short(short=0) {
        this.write_byte(short & 0xFF);
        this.write_byte((short >> 8) & 0xFF);
    }
    write_int(int=0) {
        this.write_short(int & 0xFFFF);
        this.write_short((int >> 16) & 0xFFFF);
    }
    write_bytes(bytes=[]) {
        for(let i=0; i < bytes.length; i++) {
            this.write_byte(bytes[i]);
        }
    }
    write_string(str='') {
        for(let i=0; i < str.length; i++) {
            this.write_byte(str.charCodeAt(i));
        }
    }

    set_byte(index, byte=0) {
        if(!index) return;
        this.data[index] = byte;
    }
    set_short(index, short=0) {
        this.set_byte(index, short & 0xFF);
        this.set_byte(index+1, (short >> 8) & 0xFF);
    }
    set_int(index, int=0) {
        this.set_short(index, int & 0xFFFF);
        this.set_short(index+2, (int >> 16) & 0xFFFF);
    }
    set_bytes(index, bytes=[]) {
        for(let i=0; i < bytes.length; i++) {
            this.set_byte(index+i, bytes[i]);
        }
    }




    crc32(start=0, end=this.length) {
        let crc = 0xFFFFFFFF;
        for(let i=start; i < end; i++) {
            const lookup = (crc ^ this.data[i]) & 0xFF;
            crc = (crc >> 8) ^ CRC_TABLE[lookup];
        }
        return crc ^ 0xFFFFFFFF;
    }


}
