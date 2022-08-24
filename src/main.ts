// Welcome home, Greg. How are we?

import Bot from "./models/bot";
import App from "./models/app";
import { ERROR, LOG, OK } from "./models/cnsl";
import prompts from "prompts";
import WorldProps from "./interfaces/world_props";
import { ConnectionState } from "./nebulous/enums/connection_state";
import { COMMANDS } from "./constants/command_list";
import ByteArray from "./models/bytearray";

function forceExit(): void {
    for (let bot of app.bots) {
        bot.isRunning = false;
        bot.desync();
    }
    process.exit(0xdeadbeef);
}

function connectBots(app: App): void {
    for (let i = 0; i < app.bots.length; i++) {
        let bot = app.bots[i];
        setTimeout(() => {
            bot.connect();
        }, 1800 * i);
    }
}

function main(): void {
    connectBots(app);

    let executedAsOneBot = false;
    let _singleIssuerName: string | undefined = undefined;

    async function RECURSECMD() {
        let response = await prompts({
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
                } else {
                    command = command.split(" ")[0];
                }
                if (COMMANDS.includes(command)) {
                    return true;
                }
                return "Command not found";
            },
        });

        let result;
        if (response.command.includes(" >> ")) {
            result = response.command.split(" >> ")[1] as string;
        } else {
            result = response.command as string;
        }

        let command = result.split(" ")[0];
        let commandArgsArray = result.split(" ").slice(1);

        ////////////////////////////////////////////////////////////////////////////////
        for (let i = 0; i < app.bots.length; i++) {
            // tmp_bot: bypass Bot | null: `bot` object is possibly null
            let tmp_bot: Bot | null;
            let bot: Bot;
            _singleIssuerName
                ? (tmp_bot = app.findBotByIdentifier(_singleIssuerName))
                : (tmp_bot = app.bots[i]);

            if (tmp_bot === null) {
                ERROR("Error", `Bot not found`);
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
                        } else {
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
                    } else if (commandArgsArray.join(" ").match(/^[0-9]+$/)) {
                        bot.emotionalSupportPlayerID = parseInt(
                            commandArgsArray[0]
                        );
                    } else {
                        bot.emotionalSupportPlayerName =
                            commandArgsArray.join(" ");
                    }
                    break;

                case "plasmafor":
                    if (!commandArgsArray.length) {
                        bot.plasmaFarmTargetName = null;
                        bot.plasmaFarmTargetID = null;
                    } else if (commandArgsArray.join(" ").match(/^[0-9]+$/)) {
                        bot.plasmaFarmTargetID = parseInt(commandArgsArray[0]);
                    } else {
                        bot.plasmaFarmTargetName = commandArgsArray.join(" ");
                    }
                    break;

                case "setlvlmeta":
                    bot.doLvlMeta = commandArgsArray[0].toLowerCase() === "y";
                    break;

                /*
                case "setplasmameta":
                    bot.doPlasmaMeta =
                        commandArgsArray[0].toLowerCase() === "y";
                    bot.isPlasmaMetaMainScript =
                        commandArgsArray[1].toLowerCase() === "y";
                    break;
                    */

                case "setexecbreak":
                    // stops sending "unnecessary" packets
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
                    LOG(
                        "Net Stats",
                        `\nWorld name: ${bot.world.name} (${bot.world.gameMode})\n` +
                            `Bot: ${bot.name} (${bot.internalID + 1}/${
                                app.bots.length
                            })\n` +
                            `Tokens (NR): ${bot.roomToken1
                                ?.toString(16)
                                .toUpperCase()} | ${bot.roomToken2
                                ?.toString(16)
                                .toUpperCase()}\n` +
                            `Tokens (R): ${bot.connectionToken1
                                ?.toString(16)
                                .toUpperCase()} | ${bot.connectionToken2
                                ?.toString(16)
                                .toUpperCase()}\n` +
                            `Connected: ${
                                bot.connectionState ===
                                ConnectionState.CONNECTED
                            }`
                    );
                    break;

                case "setemloop":
                    bot.isEmoteLooping = commandArgsArray[0] === "y";
                    if (commandArgsArray[1]) {
                        bot.emoteLoopIndex = parseInt(commandArgsArray[1]);
                    } else {
                        bot.emoteLoopIndex = 0;
                    }
                    break;

                case "rename":
                    bot.setName(
                        `${commandArgsArray.join(" ")}${bot.internalID}`
                    );
                    break;

                case "setmassthreshold":
                    bot.massThreshold = parseInt(commandArgsArray[0]);
                    break;

                // TODO: add to command list

                case "follow":
                    // ...
                    break;

                case "recontrol":
                    // ...
                    break;

                case "spectate":
                    // ... extend packets
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
                    // ...
                    break;

                case "test":
                    bot.test();
                    break;

                case "clear":
                    console.clear();
                    break;

                case "hexsearch":
                    for (let packet of app.allPackets) {
                        if (
                            packet
                                .hexData()
                                .toUpperCase()
                                .includes(
                                    commandArgsArray.join(" ").toUpperCase()
                                )
                        ) {
                            LOG(
                                "Net Find",
                                `Found ${commandArgsArray[0]} in ${packet
                                    .hexData()
                                    .toUpperCase()}`
                            );
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

        ///////////////////////////////////////////////////////////////////////////////
        RECURSECMD();
    }

    RECURSECMD();
}

console.clear();
process.stdout.write(
    `${String.fromCharCode(
        27
    )}]0;Source: https://github.com/Nyaanity/Nebul0us${String.fromCharCode(7)}`
);
LOG("Init", "@Nebul0us ~ Source: https://github.com/Nyaanity/Nebul0us");

let app = new App();

Promise.all([app.init()]).then(() => {
    main();
});
