"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HIGHPRIOLOG = exports.LOWPRIOLOG = exports.LOG = exports.ERROR = exports.OK = void 0;
const meth_1 = require("../private/utils/meth");
function hexToRGB(hex) {
    const r = hex >> 16;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return [r, g, b];
}
function consoleColorFromHex(hex) {
    const rgb = hexToRGB(hex);
    return `\x1b[38;2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
}
function OK(tag, text) {
    console.log(consoleColorFromHex(0x9effa1) + `[${(0, meth_1.getTime)()}] ` + `[${tag}] ${text}`);
}
exports.OK = OK;
function ERROR(tag, text) {
    console.log(consoleColorFromHex(0xc3676c) + `[${(0, meth_1.getTime)()}] ` + `[${tag}] ${text}`);
}
exports.ERROR = ERROR;
function LOG(tag, text) {
    console.log(consoleColorFromHex(0x4a2c4c) + `[${(0, meth_1.getTime)()}] ` + `[${tag}] ${text}`);
}
exports.LOG = LOG;
function LOWPRIOLOG(tag, text) {
    console.log(consoleColorFromHex(0x3b3b3b) + `[${(0, meth_1.getTime)()}] ` + `[${tag}] ${text}`);
}
exports.LOWPRIOLOG = LOWPRIOLOG;
function HIGHPRIOLOG(tag, text) {
    console.log(consoleColorFromHex(0xffabff) + `[${(0, meth_1.getTime)()}] ` + `[${tag}] ${text}`);
}
exports.HIGHPRIOLOG = HIGHPRIOLOG;
