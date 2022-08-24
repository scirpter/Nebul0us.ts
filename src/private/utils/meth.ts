import axios from "axios";

export function generateRandomName(length: number): string {
    let randomName = "";
    for (let i = 0; i < length; i++) {
        randomName += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }
    return randomName;
}

export function getTime(): string {
    const date = new Date();
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    return `${h < 10 ? `0${h}` : h}:${m < 10 ? `0${m}` : m}:${
        s < 10 ? `0${s}` : s
    }`;
}
