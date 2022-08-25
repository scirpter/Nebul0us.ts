"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const javascript_obfuscator_1 = require("javascript-obfuscator");
const glob_1 = __importDefault(require("glob"));
const fs_1 = __importDefault(require("fs"));
let files = glob_1.default.sync("./build/**/*.js");
for (let file of files) {
    let content = fs_1.default.readFileSync(file, "utf8");
    let obfuscated = (0, javascript_obfuscator_1.obfuscate)(content, {
        optionsPreset: "default",
        target: "node",
        seed: 0,
        disableConsoleOutput: false,
        selfDefending: true,
        debugProtection: false,
        debugProtectionInterval: 0,
        ignoreImports: false,
        sourceMap: false,
        sourceMapMode: "separate",
        sourceMapBaseUrl: "http://localhost:3000/",
        sourceMapFileName: "example",
        stringArray: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayThreshold: 0.75,
        stringArrayIndexShift: true,
        stringArrayIndexesType: ["hexadecimal-number"],
        stringArrayCallsTransform: false,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayWrappersCount: 2,
        stringArrayWrappersType: "function",
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersChainedCalls: true,
        stringArrayEncoding: ["base64"],
        splitStrings: true,
        splitStringsChunkLength: 10,
        unicodeEscapeSequence: false,
        forceTransformStrings: [],
        reservedStrings: [],
        identifierNamesGenerator: "hexadecimal",
        identifiersDictionary: ["foo"],
        identifiersPrefix: "",
        renameGlobals: true,
        renameProperties: false,
        renamePropertiesMode: "safe",
        reservedNames: [],
        compact: true,
        simplify: true,
        transformObjectKeys: true,
        numbersToExpressions: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
    });
    fs_1.default.writeFileSync(file, obfuscated._obfuscatedCode);
}
