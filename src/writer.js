
// This probably isn't the best way to do this. But oh well I can't find any other easy way.

// Allocate a MB
const DEFAULT_EXTEND_LENGTH = 1e+6;

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



}
