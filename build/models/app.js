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
const servers_1 = require("../nebulous/enums/servers");
const bot_1 = __importDefault(require("./bot"));
const event_listener_1 = __importDefault(require("./event_listener"));
const bot_names_1 = __importDefault(require("../constants/bot_names"));
const prompts_1 = __importDefault(require("prompts"));
const game_mode_1 = require("../nebulous/enums/game_mode");
const skins_1 = require("../nebulous/enums/skins");
const fs_1 = __importDefault(require("fs"));
const meth_1 = require("../private/utils/meth");
class App {
    constructor() {
        this.selfVerified = false;
        this.comment = "N/A";
        this.startedAt = Date.now();
        this.botName = null;
        this.server = "";
        this.botAmount = -1;
        this.bots = [];
        this.intervals = [];
        this.sessionID = new Date().getTime().toString(16);
        this.eventListener = new event_listener_1.default();
        this.gameMode = game_mode_1.GameMode.FFA;
        this.mayhem = false;
        this.searchPrivate = false;
        this.skinIndex = skins_1.Skins.misc_neb;
        this.tokens = [];
        fs_1.default.readFile("tokens.txt", "utf8", (err, data) => {
            if (err) {
                console.log(err);
            }
            for (let line of data.split("\n")) {
                line = line.trim();
                if (line.startsWith("!") ||
                    line.startsWith("#") ||
                    line === "") {
                    continue;
                }
                else {
                    this.tokens.push(line);
                }
            }
        });
        this.allPackets = [];
        this.debugMode = false;
    }
    findBotByIdentifier(name, internalID = null) {
        for (let bot of this.bots) {
            if (bot.name === name || bot.internalID === internalID) {
                return bot;
            }
        }
        return null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let serverEnum = servers_1.Server;
            let servers = Object.keys(servers_1.Server);
            let serversList = [];
            for (let i = 0; i < servers.length; i++) {
                let server = servers[i];
                serversList.push({
                    title: servers[i]
                        .toLowerCase()
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase()),
                    value: serverEnum[server],
                });
            }
            let gameModes = Object.keys(game_mode_1.GameMode);
            let gameModesList = [];
            for (let i = 0; i < gameModes.length; i++) {
                gameModesList.push({
                    title: game_mode_1.GameMode[i],
                    value: gameModes[i],
                });
            }
            let skins = Object.keys(skins_1.Skins);
            let skinsList = [];
            for (let i = 0; i < skins.length / 2; i) {
                skinsList.push({
                    title: skins_1.Skins[i],
                    value: i++,
                });
            }
            let response = yield (0, prompts_1.default)([
                {
                    type: "text",
                    name: "botName",
                    message: `Bot name?`,
                    initial: "RANDOM = Random name, BOT = Use bot name like Vector",
                },
                {
                    type: "number",
                    name: "botAmount",
                    message: `Bot amount? [Max 7 clients/IP]`,
                    min: 1,
                    max: 15,
                    initial: 3,
                },
                {
                    type: "select",
                    name: "server",
                    message: "Server?",
                    choices: serversList,
                },
                {
                    type: "select",
                    name: "gameMode",
                    message: "Game mode?",
                    choices: gameModesList,
                },
                {
                    type: "confirm",
                    name: "mayhem",
                    message: "Mayhem?",
                    initial: false,
                },
                {
                    type: "confirm",
                    name: "searchPrivate",
                    message: "Go private instead of public?",
                    initial: false,
                },
                {
                    type: "autocomplete",
                    name: "skinIndex",
                    message: "Skin?",
                    choices: skinsList,
                },
                {
                    type: "confirm",
                    name: "debugMode",
                    message: "Debug mode? This enables the hexsearch command and will slower the process significantly.",
                    initial: false,
                },
            ]);
            this.bots = [];
            this.botName = response.botName;
            this.server = response.server;
            this.botAmount = response.botAmount;
            this.gameMode = response.gameMode;
            this.mayhem = response.mayhem;
            this.searchPrivate = response.searchPrivate;
            this.skinIndex = response.skinIndex;
            this.debugMode = response.debugMode;
            let useRandomName = this.botName === "RANDOM";
            let useBotName = this.botName === "BOT";
            for (let i = 0; i < this.botAmount; i++) {
                let randomName = (0, meth_1.generateRandomName)(8);
                let randomBotName = bot_names_1.default[Math.floor(Math.random() * bot_names_1.default.length)];
                bot_names_1.default.splice(bot_names_1.default.indexOf(randomBotName), 1);
                if (this.tokens.length !== 0) {
                    let token = this.tokens.pop();
                    if (useRandomName) {
                        this.bots.push(new bot_1.default(randomName, token, i, this));
                    }
                    else if (useBotName) {
                        this.bots.push(new bot_1.default(randomBotName, token, i, this));
                    }
                    else {
                        this.bots.push(new bot_1.default(this.botName + i.toString(), token, i, this));
                    }
                }
                else {
                    if (useRandomName) {
                        this.bots.push(new bot_1.default(randomName, "", i, this));
                    }
                    else if (useBotName) {
                        this.bots.push(new bot_1.default(randomBotName, "", i, this));
                    }
                    else {
                        this.bots.push(new bot_1.default(this.botName + i.toString(), "", i, this));
                    }
                }
            }
        });
    }
}
exports.default = App;
