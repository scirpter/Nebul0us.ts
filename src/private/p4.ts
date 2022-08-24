import { obfuscate } from "javascript-obfuscator";
import glob from "glob";
import fs from "fs";

// loop through every single file and folder in "./build" and obfuscate it
let files = glob.sync("./build/**/*.js");
for (let file of files) {
    let content = fs.readFileSync(file, "utf8");
    let obfuscated: any = obfuscate(content, {
        optionsPreset: "default",
        target: "node",
        seed: 0,
        disableConsoleOutput: false,
        selfDefending: true,
        debugProtection: false,
        debugProtectionInterval: 0,
        ignoreImports: false,
        // domainLock: ["domain.com"],
        // domainLockRedirectUrl: "about:blank",
        sourceMap: false,
        sourceMapMode: "separate",
        sourceMapBaseUrl: "http://localhost:3000/",
        sourceMapFileName: "example",

        /**
         * @title String Transformations
         */

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

        /**
         * @title Identifiers Transformations
         */

        identifierNamesGenerator: "hexadecimal",
        identifiersDictionary: ["foo"],
        identifiersPrefix: "",
        renameGlobals: true,
        renameProperties: false, // breaks code
        renamePropertiesMode: "safe",
        reservedNames: [],

        /**
         * @title Other Transformations
         */

        compact: true,
        simplify: true,
        transformObjectKeys: true,
        numbersToExpressions: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: false,
        deadCodeInjectionThreshold: 0.4,
    });

    // console.log(obfuscated)
    fs.writeFileSync(file, obfuscated._obfuscatedCode);
}
