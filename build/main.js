"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./models/app"));
const cnsl_1 = require("./models/cnsl");
const prompts_1 = __importDefault(require("prompts"));
const connection_state_1 = require("./nebulous/enums/connection_state");
const command_list_1 = require("./constants/command_list");
function forceExit() {
    for (let bot of app.bots) {
        bot.isRunning = false;
        bot.desync();
    }
    process.exit(0xdeadbeef);
}
function connectBots(app) {
    for (let i = 0; i < app.bots.length; i++) {
        let bot = app.bots[i];
        setTimeout(() => {
            bot.connect();
        }, 1800 * i);
    }
}
function main() {
    connectBots(app);
    let executedAsOneBot = false;
    let _singleIssuerName = undefined;
    function RECURSECMD() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let response = yield (0, prompts_1.default)({
                type: "text",
                name: "command",
                message: ``,
                validate: (value) => {
                    if (value === "") {
                        return "Command cannot be empty";
                    }
                    let command = value.toLowerCase();
                    if (command.includes(" >> ")) {
                        _singleIssuerName = command.split(" >> ")[0];
                        command = command.split(" >> ")[1].split(" ")[0];
                        executedAsOneBot = true;
                    }
                    else {
                        command = command.split(" ")[0];
                    }
                    if (command_list_1.COMMANDS.includes(command)) {
                        return true;
                    }
                    return "Command not found";
                },
            });
            let result;
            if (response.command.includes(" >> ")) {
                result = response.command.split(" >> ")[1];
            }
            else {
                result = response.command;
            }
            let command = result.split(" ")[0];
            let commandArgsArray = result.split(" ").slice(1);
            for (let i = 0; i < app.bots.length; i++) {
                let tmp_bot;
                let bot;
                _singleIssuerName
                    ? (tmp_bot = app.findBotByIdentifier(_singleIssuerName))
                    : (tmp_bot = app.bots[i]);
                if (tmp_bot === null) {
                    (0, cnsl_1.ERROR)("Error", `Bot not found`);
                    break;
                }
                bot = tmp_bot;
                switch (command) {
                    case "connect":
                        setTimeout(() => {
                            bot.connect();
                        }, 1800 * i);
                        break;
                    case "join":
                        setTimeout(() => {
                            if (!commandArgsArray.join(" ").match(/^[0-9]+$/)) {
                                bot.joinGame(commandArgsArray.join(" "));
                            }
                            else {
                                bot.joinGame(parseInt(commandArgsArray[0]));
                            }
                        }, 1800 * i);
                        break;
                    case "enter":
                        bot.enterGame(false);
                        break;
                    case "rejoin":
                        setTimeout(() => {
                            bot.rejoin();
                        }, 1800 * i);
                        break;
                    case "desync":
                        bot.desync();
                        break;
                    case "feed":
                        if (!commandArgsArray.length) {
                            bot.emotionalSupportPlayerName = null;
                            bot.emotionalSupportPlayerID = null;
                        }
                        else if (commandArgsArray.join(" ").match(/^[0-9]+$/)) {
                            bot.emotionalSupportPlayerID = parseInt(commandArgsArray[0]);
                        }
                        else {
                            bot.emotionalSupportPlayerName =
                                commandArgsArray.join(" ");
                        }
                        break;
                    case "plasmafor":
                        if (!commandArgsArray.length) {
                            bot.plasmaFarmTargetName = null;
                            bot.plasmaFarmTargetID = null;
                        }
                        else if (commandArgsArray.join(" ").match(/^[0-9]+$/)) {
                            bot.plasmaFarmTargetID = parseInt(commandArgsArray[0]);
                        }
                        else {
                            bot.plasmaFarmTargetName = commandArgsArray.join(" ");
                        }
                        break;
                    case "setlvlmeta":
                        bot.doLvlMeta = commandArgsArray[0].toLowerCase() === "y";
                        break;
                    case "setexecbreak":
                        bot.execBreak = commandArgsArray[0].toLowerCase() === "y";
                        break;
                    case "setplasmafarm":
                        bot.isFarming = commandArgsArray[0].toLowerCase() === "y";
                        break;
                    case "exit":
                        forceExit();
                        break;
                    case "setautorespawn":
                        bot.isAutoRejoining =
                            commandArgsArray[0].toLowerCase() === "y";
                        break;
                    case "chat":
                        if (!bot.token || bot.token === ",-") {
                            continue;
                        }
                        bot.chat(commandArgsArray.join(" "));
                        break;
                    case "emote":
                        if (!commandArgsArray[0].match(/^[0-9]+$/)) {
                            continue;
                        }
                        bot.emote(parseInt(commandArgsArray[0]));
                        break;
                    case "split":
                        if (!commandArgsArray[0].match(/^[0-9]+$/)) {
                            continue;
                        }
                        for (let i = 0; i < parseInt(commandArgsArray[0]); i++) {
                            bot.split();
                        }
                        break;
                    case "net":
                        (0, cnsl_1.LOG)("Net Stats", `\nWorld name: ${bot.world.name} (${bot.world.gameMode})\n` +
                            `Bot: ${bot.name} (${bot.internalID + 1}/${app.bots.length})\n` +
                            `Tokens (NR): ${(_a = bot.roomToken1) === null || _a === void 0 ? void 0 : _a.toString(16).toUpperCase()} | ${(_b = bot.roomToken2) === null || _b === void 0 ? void 0 : _b.toString(16).toUpperCase()}\n` +
                            `Tokens (R): ${(_c = bot.connectionToken1) === null || _c === void 0 ? void 0 : _c.toString(16).toUpperCase()} | ${(_d = bot.connectionToken2) === null || _d === void 0 ? void 0 : _d.toString(16).toUpperCase()}\n` +
                            `Connected: ${bot.connectionState ===
                                connection_state_1.ConnectionState.CONNECTED}`);
                        break;
                    case "setemloop":
                        bot.isEmoteLooping = commandArgsArray[0] === "y";
                        if (commandArgsArray[1]) {
                            bot.emoteLoopIndex = parseInt(commandArgsArray[1]);
                        }
                        else {
                            bot.emoteLoopIndex = 0;
                        }
                        break;
                    case "rename":
                        bot.setName(`${commandArgsArray.join(" ")}${bot.internalID}`);
                        break;
                    case "setmassthreshold":
                        bot.massThreshold = parseInt(commandArgsArray[0]);
                        break;
                    case "follow":
                        break;
                    case "recontrol":
                        break;
                    case "spectate":
                        break;
                    case "setmassad":
                        if (bot.token !== ",-" && bot.token !== "") {
                            bot.isMassAdvertising = commandArgsArray[0] === "y";
                            bot.massAdvertiseMessage = commandArgsArray
                                .slice(1)
                                .join(" ");
                        }
                        break;
                    case "creategame":
                        break;
                    case "test":
                        bot.test();
                        break;
                    case "clear":
                        console.clear();
                        break;
                    case "hexsearch":
                        for (let packet of app.allPackets) {
                            if (packet
                                .hexData()
                                .toUpperCase()
                                .includes(commandArgsArray.join(" ").toUpperCase())) {
                                (0, cnsl_1.LOG)("Net Find", `Found ${commandArgsArray[0]} in ${packet
                                    .hexData()
                                    .toUpperCase()}`);
                            }
                        }
                        break;
                    default:
                        break;
                }
                if (executedAsOneBot) {
                    executedAsOneBot = false;
                    break;
                }
            }
            RECURSECMD();
        });
    }
    RECURSECMD();
}
console.clear();
process.stdout.write(`${String.fromCharCode(27)}]0;Source: https://github.com/Nyaanity/Nebul0us${String.fromCharCode(7)}`);
(0, cnsl_1.LOG)("Init", "@Nebul0us ~ Source: https://github.com/Nyaanity/Nebul0us");
let app = new app_1.default();
Promise.all([app.init()]).then(() => {
    main();
});
