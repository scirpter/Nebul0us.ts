import { Server } from "../nebulous/enums/servers";
import Bot from "./bot";
import EventListener from "./event_listener";
import BOT_NAMES from "../constants/bot_names";
import prompts from "prompts";
import { GameMode } from "../nebulous/enums/game_mode";
import { Skins } from "../nebulous/enums/skins";
import fs from "fs";
import { generateRandomName } from "../private/utils/meth";
import ByteArray from "./bytearray";

class App {
    selfVerified: boolean;
    comment: string;
    startedAt: number;

    eventListener: EventListener;
    sessionID: string;
    bots: Bot[];
    botName: string | null;
    server: string;
    intervals: object[];
    botAmount: number;

    gameMode: GameMode;
    mayhem: boolean;
    searchPrivate: boolean;
    skinIndex: number;

    tokens: string[];

    allPackets: ByteArray[];
    debugMode: boolean;

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
        this.eventListener = new EventListener();

        this.gameMode = GameMode.FFA;
        this.mayhem = false;
        this.searchPrivate = false;
        this.skinIndex = Skins.misc_neb;

        this.tokens = [];

        fs.readFile("tokens.txt", "utf8", (err, data) => {
            if (err) {
                console.log(err);
            }
            for (let line in data.split("\n")) {
                line = line.trim();
                if (
                    line.startsWith("!") ||
                    line.startsWith("#") ||
                    line === ""
                ) {
                    // aka commented out/blacklisted
                    continue;
                } else {
                    this.tokens.push(line);
                }
            }
        });

        this.allPackets = [];
        this.debugMode = false;
    }

    public findBotByIdentifier(
        name: string,
        internalID: number | null = null
    ): Bot | null {
        for (let bot of this.bots) {
            if (bot.name === name || bot.internalID === internalID) {
                return bot;
            }
        }
        return null;
    }

    public async init(): Promise<void> {
        let serverEnum: any = Server;
        let servers: string[] = Object.keys(Server);
        let serversList: any = [];
        for (let i = 0; i < servers.length; i++) {
            let server: string = servers[i];
            serversList.push({
                title: servers[i]
                    .toLowerCase()
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase()),
                value: serverEnum[server],
            });
        }

        let gameModes = Object.keys(GameMode);
        let gameModesList: any = [];
        for (let i = 0; i < gameModes.length; i++) {
            gameModesList.push({
                title: GameMode[i],
                value: gameModes[i],
            });
        }

        let skins = Object.keys(Skins);
        let skinsList: any = [];
        for (let i = 0; i < skins.length / 2; i) {
            skinsList.push({
                title: Skins[i],
                value: i++,
            });
        }

        let response = await prompts([
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
                message:
                    "Debug mode? This enables the hexsearch command and will slower the process significantly.",
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
            let randomName = generateRandomName(8);
            let randomBotName =
                BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
            BOT_NAMES.splice(BOT_NAMES.indexOf(randomBotName), 1); // remove used bot name

            if (this.tokens.length !== 0) {
                let token = this.tokens.pop() as string;
                if (useRandomName) {
                    this.bots.push(new Bot(randomName, token, i, this));
                } else if (useBotName) {
                    this.bots.push(new Bot(randomBotName, token, i, this));
                } else {
                    this.bots.push(
                        new Bot(this.botName + i.toString(), token, i, this)
                    );
                }
            } else {
                if (useRandomName) {
                    this.bots.push(new Bot(randomName, "", i, this));
                } else if (useBotName) {
                    this.bots.push(new Bot(randomBotName, "", i, this));
                } else {
                    this.bots.push(
                        new Bot(this.botName + i.toString(), "", i, this)
                    );
                }
            }
        }
    }
}

export default App;
