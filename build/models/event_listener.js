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
const connection_state_1 = require("../nebulous/enums/connection_state");
const fs_1 = __importDefault(require("fs"));
const packets_1 = require("../nebulous/packets");
const cnsl_1 = require("./cnsl");
class EventListener {
    constructor() { }
    onBotDeath(packet) {
        if (packet.bot.isAutoRejoining &&
            packet.bot.connectionState === connection_state_1.ConnectionState.CONNECTED &&
            !(packet.bot.world.timeLeft >= 65500 &&
                packet.bot.world.timeLeft <= 65536)) {
            packet.bot.enterGame();
        }
    }
    onPlayerJoin(packet) {
        var _a, _b, _c, _d, _e, _f;
        if (packet.bot.internalID === 0) {
            if (packet instanceof packets_1.ClientPreferences) {
                (0, cnsl_1.LOG)("Player Join", `${(_a = packet.player) === null || _a === void 0 ? void 0 : _a.name} (${(_b = packet.player) === null || _b === void 0 ? void 0 : _b.id}) joined (NET ID ${(_c = packet.player) === null || _c === void 0 ? void 0 : _c.netID})`);
            }
            else if (packet instanceof packets_1.GameData) {
                (0, cnsl_1.LOG)("Player Join", `${(_d = packet.player) === null || _d === void 0 ? void 0 : _d.name} (${(_e = packet.player) === null || _e === void 0 ? void 0 : _e.id}) joined (NET ID ${(_f = packet.player) === null || _f === void 0 ? void 0 : _f.netID})`);
            }
        }
    }
    onGameChatMessage(packet) {
        return __awaiter(this, void 0, void 0, function* () {
            let all = packet.msg.split(" ");
            let command = packet.msg.toLowerCase().split(" ")[0];
            let commandArgsArray = packet.msg.split(" ").slice(1);
            let commandArgsString = commandArgsArray.join(" ");
            if (packet.bot.internalID === 0) {
                if (packet.msg.startsWith("?")) {
                }
                (0, cnsl_1.LOWPRIOLOG)("Game Chat", `${packet.playerName} (${packet.playerID}): ${packet.msg}`);
                let dt = new Date();
                let log = `[${dt.toLocaleString()}] ${packet.playerName} (${packet.playerID}): ${packet.msg}\n\n`;
                yield fs_1.default.appendFile(`logs/${packet.bot.app.sessionID}.log`, log, (err) => {
                    if (err)
                        throw err;
                });
                if (packet.msg.startsWith("!kick")) {
                    let gameName = packet.bot.world.name;
                    return;
                    for (let i = 0; i < packet.bot.app.bots.length; i++) {
                        setTimeout(() => {
                            let bot = packet.bot.app.bots[i];
                            bot.desync();
                            bot.connect();
                            setTimeout(() => {
                                bot.joinGame(gameName);
                            }, 1800 * i);
                        }, 1800 * i);
                    }
                }
            }
        });
    }
}
exports.default = EventListener;
