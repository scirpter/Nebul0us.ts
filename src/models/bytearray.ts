class ByteArray {
    offset: number;
    data: Buffer;

    constructor(data: Buffer = Buffer.alloc(0)) {
        this.offset = 0;
        this.data = data;
    }

    public spaceLeft(): number {
        return this.data.length - this.offset;
    }

    public hexData(): string {
        let result = "";
        for (let i = 0; i < this.data.length; i++) {
            result += this.data[i].toString(16).padStart(2, "0");
        }
        return result;
    }

    // public hexdump(): void {}

    public UTF8sToUTF8m(buffer: Buffer): Buffer {
        let newStr: number[] = [];
        let i = 0;
        while (i < buffer.length) {
            let byte1 = buffer[i];
            if ((byte1 & 0x80) === 0) {
                if (byte1 === 0) {
                    newStr.push(0xc0);
                    newStr.push(0x80);
                } else {
                    newStr.push(byte1);
                }
            } else if ((byte1 & 0xe0) == 0xc0) {
                newStr.push(byte1);
                newStr.push(buffer[++i]);
            } else if ((byte1 & 0xf0) == 0xe0) {
                newStr.push(byte1);
                newStr.push(buffer[++i]);
                newStr.push(buffer[++i]);
            } else if ((byte1 & 0xf8) == 0xf0) {
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

    public writeUTF(string: string): ByteArray {
        let encoded = this.UTF8sToUTF8m(Buffer.from(string, "utf8"));
        this.writeShort(encoded.length);
        this.writeRaw(encoded);
        return this;
    }

    public writeBool(bool: boolean): ByteArray {
        this.writeByte(bool ? 1 : 0);
        return this;
    }

    public writeByte(byte: number): ByteArray {
        this.data = Buffer.concat([this.data, Buffer.from([byte])]);
        return this;
    }

    public writeShort(short: number): ByteArray {
        this.data = Buffer.concat([
            this.data,
            Buffer.from([short >> 8, short]),
        ]);
        return this;
    }

    public writeInt(int: number): ByteArray {
        this.data = Buffer.concat([
            this.data,
            Buffer.from([int >> 24, int >> 16, int >> 8, int]),
        ]);
        return this;
    }

    public writeFloat(float: number): ByteArray {
        let buf = Buffer.alloc(4);
        buf.writeFloatLE(float, 0);
        this.data = Buffer.concat([this.data, buf]);
        return this;
    }

    public writeLong(long: number): ByteArray {
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

    public writeHex(hex: string): ByteArray {
        let buffer = Buffer.from(hex, "hex");
        this.writeRaw(buffer);
        return this;
    }

    public writeRaw(buffer: Buffer): ByteArray {
        this.data = Buffer.concat([this.data, buffer]);
        return this;
    }

    public UTF8mToUTF8s(buffer: Buffer): Buffer {
        let newStr: number[] = [];
        let length = buffer.length;
        let i = 0;
        while (i < length) {
            let byte1 = buffer[i];
            if ((byte1 & 0x80) === 0) {
                newStr.push(byte1);
            } else if ((byte1 & 0xe0) == 0xc0) {
                let byte2 = buffer[++i];
                if (byte1 !== 0xc0 || byte2 !== 0x80) {
                    newStr.push(byte1);
                    newStr.push(byte2);
                } else {
                    newStr.push(0x00);
                }
            } else if ((byte1 & 0xf0) == 0xe0) {
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

    public readUTF(): string {
        let length = this.readShort();
        let val;
        if (length > 0) {
            val = this.UTF8mToUTF8s(this.readFully(length));
        } else {
            val = "";
        }
        return val.toString("utf8");
    }

    public readBool(): boolean {
        let bool = this.readByte() === 1;
        return bool;
    }

    public readByte(): number {
        let byte = this.data[this.offset];
        this.offset++;
        return byte;
    }

    public readShort(): number {
        let short =
            ((this.readByte() & 255) << 8) | ((this.readByte() & 255) << 0);
        return short;
    }

    public readInt(): number {
        let int = 0;
        int |=
            (this.readByte() << 24) |
            (this.readByte() << 16) |
            (this.readByte() << 8) |
            (this.readByte() << 0);
        // this is
        return int;
    }

    public readFloat(): number {
        let float = this.data.readFloatBE(this.offset);
        this.offset += 4;
        return float;
    }

    public readLong(): number {
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

    public readFully(length: number): Buffer {
        let buffer = this.data.slice(this.offset, this.offset + length);
        this.offset += length;
        return buffer;
    }

    public D(): number {
        return (
            ((this.readByte() & 255) << 16) +
            ((this.readByte() & 255) << 8) +
            (this.readByte() & 255)
        );
    }

    public b(f10: number): number {
        return (
            ((f10 - 0.0) *
                (((this.readByte() & 255) << 16) +
                    ((this.readByte() & 255) << 8) +
                    ((this.readByte() & 255) << 0))) /
                1.6777215e7 +
            0.0
        );
    }

    public I(f: number, f2: number): number {
        return ((this.readShort() & 65535) * (f2 - f)) / 65535.0 + f;
    }

    public n(f: number, f2: number): number {
        return ((this.readByte() & 255) * (f2 - f)) / 255.0 + f;
    }

    public q(f: number, f2: number): number {
        return (
            ((((this.readByte() & 255) << 16) +
                ((this.readByte() & 255) << 8) +
                (this.readByte() & 255)) *
                (f2 - f)) /
                1.6777215e7 +
            f
        );
    }

    public m1715j(f: number): number {
        return ((f - 0.0) * (this.readShort() & 65535)) / 65535.0 + 0.0;
    }

    public m1716i(): number {
        return (
            ((this.readByte() & 255) << 16) +
            ((this.readByte() & 255) << 8) +
            ((this.readByte() & 255) << 0)
        );
    }

    public m1717b(f: number): number {
        return (
            ((f - 0.0) *
                (((this.readByte() & 255) << 16) +
                    ((this.readByte() & 255) << 8) +
                    ((this.readByte() & 255) << 0))) /
                1.6777215e7 +
            0.0
        );
    }

    public m1718a(f: number, f2: number): number {
        return ((f2 - f) * (this.readByte() & 255)) / 255.0 + f;
    }
}

export default ByteArray;
