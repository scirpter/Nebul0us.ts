"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = exports.generateRandomName = void 0;
function generateRandomName(length) {
    let randomName = "";
    for (let i = 0; i < length; i++) {
        randomName += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }
    return randomName;
}
exports.generateRandomName = generateRandomName;
function getTime() {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${s < 10 ? `0${s}` : s}`;
}
exports.getTime = getTime;
