import * as readline from "readline";
import { getTime } from "../private/utils/meth";

function hexToRGB(hex: number): [number, number, number] {
    const r = hex >> 16;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return [r, g, b];
}

function consoleColorFromHex(hex: number): string {
    const rgb = hexToRGB(hex);
    return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
}

export function OK(tag: string, text: string): void {
    console.log(
        consoleColorFromHex(0x9effa1) + `[${getTime()}] ` + `[${tag}] ${text}`
    );
}

export function ERROR(tag: string, text: string): void {
    console.log(
        consoleColorFromHex(0xc3676c) + `[${getTime()}] ` + `[${tag}] ${text}`
    );
}

export function LOG(tag: string, text: string): void {
    console.log(
        consoleColorFromHex(0x4a2c4c) + `[${getTime()}] ` + `[${tag}] ${text}`
    );
}

export function LOWPRIOLOG(tag: string, text: string): void {
    console.log(
        consoleColorFromHex(0x3b3b3b) + `[${getTime()}] ` + `[${tag}] ${text}`
    );
}

export function HIGHPRIOLOG(tag: string, text: string): void {
    console.log(
        consoleColorFromHex(0xffabff) + `[${getTime()}] ` + `[${tag}] ${text}`
    );
}
