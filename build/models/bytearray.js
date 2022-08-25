"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ByteArray {
    constructor(data = Buffer.alloc(0)) {
        this.offset = 0;
        this.data = data;
    }
    spaceLeft() {
        return this.data.length - this.offset;
    }
    hexData() {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            result += this.data[i].toString(16).padStart(2, "0");
        }
        return result;
    }
    UTF8sToUTF8m(buffer) {
        let newStr = [];
        let i = 0;
        while (i < buffer.length) {
            let byte1 = buffer[i];
            if ((byte1 & 0x80) === 0) {
                if (byte1 === 0) {
                    newStr.push(0xc0);
                    newStr.push(0x80);
                }
                else {
                    newStr.push(byte1);
                }
            }
            else if ((byte1 & 0xe0) == 0xc0) {
                newStr.push(byte1);
                newStr.push(buffer[++i]);
            }
            else if ((byte1 & 0xf0) == 0xe0) {
                newStr.push(byte1);
                newStr.push(buffer[++i]);
                newStr.push(buffer[++i]);
            }
            else if ((byte1 & 0xf8) == 0xf0) {
                let byte2 = buffer[++i];
                let byte3 = buffer[++i];
                let byte4 = buffer[++i];
                let u21 = (byte1 & 0x07) << 18;
                u21 += (byte2 & 0x3f) << 12;
                u21 += (byte3 & 0x3f) << 6;
                u21 += byte4 & 0x3f;
                newStr.push(0xed);
                newStr.push(0xa0 + (((u21 >> 16) - 1) & 0x0f));
                newStr.push(0x80 + ((u21 >> 10) & 0x3f));
                newStr.push(0xed);
                newStr.push(0xb0 + ((u21 >> 6) & 0x0f));
                newStr.push(byte4);
            }
            i++;
        }
        return Buffer.from(newStr);
    }
    writeUTF(string) {
        let encoded = this.UTF8sToUTF8m(Buffer.from(string, "utf8"));
        this.writeShort(encoded.length);
        this.writeRaw(encoded);
        return this;
    }
    writeBool(bool) {
        this.writeByte(bool ? 1 : 0);
        return this;
    }
    writeByte(byte) {
        this.data = Buffer.concat([this.data, Buffer.from([byte])]);
        return this;
    }
    writeShort(short) {
        this.data = Buffer.concat([
            this.data,
            Buffer.from([short >> 8, short]),
        ]);
        return this;
    }
    writeInt(int) {
        this.data = Buffer.concat([
            this.data,
            Buffer.from([int >> 24, int >> 16, int >> 8, int]),
        ]);
        return this;
    }
    writeFloat(float) {
        let buf = Buffer.alloc(4);
        buf.writeFloatLE(float, 0);
        this.data = Buffer.concat([this.data, buf]);
        return this;
    }
    writeLong(long) {
        this.data = Buffer.concat([
            this.data,
            Buffer.from([
                long >> 56,
                long >> 48,
                long >> 40,
                long >> 32,
                long >> 24,
                long >> 16,
                long >> 8,
                long,
            ]),
        ]);
        return this;
    }
    writeHex(hex) {
        let buffer = Buffer.from(hex, "hex");
        this.writeRaw(buffer);
        return this;
    }
    writeRaw(buffer) {
        this.data = Buffer.concat([this.data, buffer]);
        return this;
    }
    UTF8mToUTF8s(buffer) {
        let newStr = [];
        let length = buffer.length;
        let i = 0;
        while (i < length) {
            let byte1 = buffer[i];
            if ((byte1 & 0x80) === 0) {
                newStr.push(byte1);
            }
            else if ((byte1 & 0xe0) == 0xc0) {
                let byte2 = buffer[++i];
                if (byte1 !== 0xc0 || byte2 !== 0x80) {
                    newStr.push(byte1);
                    newStr.push(byte2);
                }
                else {
                    newStr.push(0x00);
                }
            }
            else if ((byte1 & 0xf0) == 0xe0) {
                let byte2 = buffer[++i];
                let byte3 = buffer[++i];
                if (i + 3 < length && byte1 == 0xed && (byte2 & 0xf0) == 0xa0) {
                    let byte4 = buffer[i + 1];
                    let byte5 = buffer[i + 2];
                    let byte6 = buffer[i + 3];
                    if (byte4 == 0xed && (byte5 & 0xf0) == 0xb0) {
                        i += 3;
                        let u21 = ((byte2 & 0x0f) + 1) << 16;
                        u21 += (byte3 & 0x3f) << 10;
                        u21 += (byte5 & 0x0f) << 6;
                        u21 += byte6 & 0x3f;
                        newStr.push(0xf0 + ((u21 >> 18) & 0x07));
                        newStr.push(0x80 + ((u21 >> 12) & 0x3f));
                        newStr.push(0x80 + ((u21 >> 6) & 0x3f));
                        newStr.push(0x80 + (u21 & 0x3f));
                        continue;
                    }
                }
                newStr.push(byte1);
                newStr.push(byte2);
                newStr.push(byte3);
            }
            i++;
        }
        return Buffer.from(newStr);
    }
    readUTF() {
        let length = this.readShort();
        let val;
        if (length > 0) {
            val = this.UTF8mToUTF8s(this.readFully(length));
        }
        else {
            val = "";
        }
        return val.toString("utf8");
    }
    readBool() {
        let bool = this.readByte() === 1;
        return bool;
    }
    readByte() {
        let byte = this.data[this.offset];
        this.offset++;
        return byte;
    }
    readShort() {
        let short = ((this.readByte() & 255) << 8) | ((this.readByte() & 255) << 0);
        return short;
    }
    readInt() {
        let int = 0;
        int |=
            (this.readByte() << 24) |
                (this.readByte() << 16) |
                (this.readByte() << 8) |
                (this.readByte() << 0);
        return int;
    }
    readFloat() {
        let float = this.data.readFloatLE(this.offset);
        this.offset += 4;
        return float;
    }
    readLong() {
        let long = 0;
        long |= (this.readByte() & 255) << 56;
        long |= (this.readByte() & 255) << 48;
        long |= (this.readByte() & 255) << 40;
        long |= (this.readByte() & 255) << 32;
        long |= (this.readByte() & 255) << 24;
        long |= (this.readByte() & 255) << 16;
        long |= (this.readByte() & 255) << 8;
        long |= (this.readByte() & 255) << 0;
        return long;
    }
    readFully(length) {
        let buffer = this.data.slice(this.offset, this.offset + length);
        this.offset += length;
        return buffer;
    }
    D() {
        return (((this.readByte() & 255) << 16) +
            ((this.readByte() & 255) << 8) +
            (this.readByte() & 255));
    }
    I(f, f2) {
        return ((this.readShort() & 65535) * (f2 - f)) / 65535.0 + f;
    }
    n(f, f2) {
        return ((this.readByte() & 255) * (f2 - f)) / 255.0 + f;
    }
    q(f, f2) {
        return (((((this.readByte() & 255) << 16) +
            ((this.readByte() & 255) << 8) +
            (this.readByte() & 255)) *
            (f2 - f)) /
            1.6777215e7 +
            f);
    }
    m1715j(f) {
        return ((f - 0.0) * (this.readShort() & 65535)) / 65535.0 + 0.0;
    }
    m1716i() {
        return (((this.readByte() & 255) << 16) +
            ((this.readByte() & 255) << 8) +
            ((this.readByte() & 255) << 0));
    }
    m1717b(f) {
        return (((f - 0.0) *
            (((this.readByte() & 255) << 16) +
                ((this.readByte() & 255) << 8) +
                ((this.readByte() & 255) << 0))) /
            1.6777215e7 +
            0.0);
    }
    m1718a(f, f2) {
        return ((f2 - f) * (this.readByte() & 255)) / 255.0 + f;
    }
}
exports.default = ByteArray;
