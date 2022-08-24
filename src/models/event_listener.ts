import { ConnectionState } from "../nebulous/enums/connection_state";
import fs from "fs";
import {
    ClientPreferences,
    GameChat,
    GameData,
    SessionStats,
} from "../nebulous/packets";
import { LOG, LOWPRIOLOG, OK } from "./cnsl";
import Bot from "./bot";
import WorldProps from "../interfaces/world_props";

class EventListener {
    constructor() {}

    public onBotDeath(packet: SessionStats): void {
        if (
            packet.bot.isAutoRejoining &&
            packet.bot.connectionState === ConnectionState.CONNECTED &&
            // lobby has ended, ignore packet
            !(
                packet.bot.world.timeLeft >= 65500 &&
                packet.bot.world.timeLeft <= 65536
            )
        ) {
            packet.bot.enterGame();
        }
    }

    public onPlayerJoin(packet: ClientPreferences | GameData): void {
        if (packet.bot.internalID === 0) {
            if (packet instanceof ClientPreferences) {
                LOG(
                    "Player Join",
                    `${packet.player?.name} (${packet.player?.id}) joined (NET ID ${packet.player?.netID})`
                );
            } else if (packet instanceof GameData) {
                LOG(
                    "Player Join",
                    `${packet.player?.name} (${packet.player?.id}) joined (NET ID ${packet.player?.netID})`
                );
            }
        }
    }

    public async onGameChatMessage(packet: GameChat): Promise<void> {
        let all = packet.msg.split(" ");
        let command = packet.msg.toLowerCase().split(" ")[0];
        let commandArgsArray = packet.msg.split(" ").slice(1);
        let commandArgsString = commandArgsArray.join(" ");

        if (packet.bot.internalID === 0) {
            // NOTE: implement chat commands?
            if (packet.msg.startsWith("?")) {
            }

            LOWPRIOLOG(
                "Game Chat",
                `${packet.playerName} (${packet.playerID}): ${packet.msg}`
            );

            let dt = new Date();
            let log = `[${dt.toLocaleString()}] ${packet.playerName} (${
                packet.playerID
            }): ${packet.msg}\n\n`;

            await fs.appendFile(
                `logs/${packet.bot.app.sessionID}.log`,
                log,
                (err) => {
                    if (err) throw err;
                }
            );

            if (packet.msg.startsWith("!kick")) {
                // block kick by instant rejoin

                let gameName = packet.bot.world.name;
                return;
                // TODO: finish kick protection

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
    }
}

export default EventListener;
