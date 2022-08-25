import {
    Difficulty,
    GameMode,
    WorldSize,
    ItemType,
    SpellType,
    SpellStatus,
    HoleType,
    GameVisibility,
    SplitMultiplier,
    PacketIndex,
    Skins,
    ConnectionState,
    BaseEvents,
    PlayerVisibility,
    JoinResults,
    ClickType,
    ClanRank,
    NameFonts,
    ColorCycle,
} from "./enums/all";
import Player from "./models/player";
import Bot from "../models/bot";
import ByteArray from "../models/bytearray";
import WorldProps from "../interfaces/world_props";
import { appendFile } from "fs";
import { HIGHPRIOLOG, LOG, OK } from "../models/cnsl";

export class Packet {
    bot: Bot;
    packetIndex: PacketIndex;
    data: Buffer = Buffer.alloc(0);

    constructor(
        bot: Bot,
        packetIndex: PacketIndex,
        data: Buffer = Buffer.alloc(0)
    ) {
        this.bot = bot;
        this.packetIndex = packetIndex;
        this.data = data;
    }

    public write(): Buffer {
        return Buffer.from(
            new ByteArray()
                .writeByte(this.packetIndex.valueOf())
                .writeRaw(this.data).data
        );
    }
}

export class SessionStats extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.SESSION_STATS, data);
    }

    public parse(): void {
        this.bot.app.eventListener.onBotDeath(this);
    }
}

export class Disconnect extends Packet {
    constructor(bot: Bot) {
        super(bot, PacketIndex.DISCONNECT);
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeInt(this.bot.connectionToken1).data;
        return super.write();
    }
}

export class JoinRequest extends Packet {
    constructor(bot: Bot) {
        super(bot, PacketIndex.JOIN_REQUEST);
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeShort(this.bot.app.skinIndex)
            .writeUTF(this.bot.name)
            .writeShort(0xff00)
            .writeInt(this.bot.name.length)
            .writeShort(0xffff)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeHex(
                // also includes stuff like cycle, hat, etc.. not needed for now.
                "e1d4520000ff0000000000ff00000000000000000000ff0005000000000000000000"
            )
            .writeInt(0x00000000) // ad perk
            .writeInt(this.bot.connectionToken1)
            .writeHex("7777777777").data;
        return super.write();
    }
}

export class JoinResult extends Packet {
    netID: number;
    playerName: string;
    roomToken2: number;
    clickType: string;
    clanRank: string;
    nameFont: string;
    colorCycle: string;

    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.JOIN_RESULT, data);

        this.netID = 0;
        this.playerName = "";
        this.roomToken2 = 0x00000000;
        this.clickType = ClickType[ClickType.NORMAL];
        this.clanRank = ClanRank[ClanRank.INVALID];
        this.nameFont = NameFonts[NameFonts.DEFAULT];
        this.colorCycle = ColorCycle[ColorCycle.NONE];
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);

        this.roomToken2 = bArr.readInt();

        bArr.readByte();
        this.netID = bArr.readByte();
        let s = bArr.readShort();
        let i5 = bArr.readInt();
        let n2 = bArr.readByte();
        this.playerName = bArr.readUTF();

        // not implemented: sync player list on player rename

        let i6 = bArr.readInt();
        let j = bArr.readLong();
        let str2 = bArr.readUTF();
        let i7 = bArr.readByte();
        let i8 = bArr.readInt();
        let z = bArr.readBool();
        let b = bArr.readByte();
        let i3 = bArr.readInt();

        let bArr1Len = bArr.readByte();
        let bArr1 = bArr.readFully(bArr1Len);
        let bArr2Len = bArr.readByte();
        let bArr2 = bArr.readFully(bArr2Len);

        this.clickType = ClickType[bArr.readByte()];
        let i11 = bArr.readInt();
        this.clanRank = ClanRank[bArr.readByte()];
        let a = bArr.readByte();
        let f = bArr.readShort();
        let str3 = bArr.readUTF();
        let a_x0 = bArr.readByte();
        let i12 = bArr.readInt();
        let a_w0 = bArr.readByte();
        let a_k12 = bArr.readByte();
        let f_k12 = bArr.readShort();
        let str4 = bArr.readUTF();
        let i13 = bArr.readInt();
        let i14 = bArr.readInt();
        let i15 = bArr.readInt();
        let a_i1 = bArr.readByte();
        this.nameFont = NameFonts[bArr.readByte()];
        let bArr3_firstByte = bArr.readByte();
        this.colorCycle = ColorCycle[bArr.readByte()];
        let s2 = bArr.readShort();
        let m1707q_funcResult = bArr.readShort();
        let i4 = bArr.readInt();
        let bArr3Len = bArr.readByte();
        let bArr3 = bArr.readFully(bArr3Len);
        let i9 = bArr.readByte();
        // ...
        // ... too lazy, continue for me. ^-^
        // ...
    }
}

export class ConnectRequest extends Packet {
    gameMode: GameMode;
    mayhem: boolean;
    searchPrivate: boolean;

    constructor(
        bot: Bot,
        gameMode: GameMode = GameMode.FFA_ULTRA,
        mayhem: boolean = false,
        searchPrivate: boolean = true
    ) {
        super(bot, PacketIndex.CONNECT_REQUEST);
        this.gameMode = gameMode;
        this.searchPrivate = searchPrivate;
        this.mayhem = mayhem;
    }

    public write(): Buffer {
        if (!this.bot.connectionToken1 || !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(0x00000000)
            .writeInt(this.bot.connectionToken1)
            .writeByte(this.gameMode)
            .writeBool(this.searchPrivate) // should actually be writeByte
            .writeInt(0xffffffff)
            .writeUTF(this.bot.token)
            .writeByte(PlayerVisibility.APPEAR_OFFLINE)
            .writeShort(0x0445)
            .writeBool(this.mayhem)
            .writeShort(this.bot.app.skinIndex)
            .writeUTF(this.bot.name)
            .writeByte(0xff)
            .writeInt(0x00000000)
            .writeByte(this.bot.name.length)
            .writeShort(0xffff)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeHex(
                // also includes stuff like cycle, hat, etc.. not needed for now.
                "e1d4520000ff0000000000ff00000000000000000000ff000577777777770000000000000000000000017bf8"
            )
            .writeInt(this.bot.connectionToken2).data;

        return super.write();
    }
}

export class ConnectResult2 extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.CONNECT_RESULT_2, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        let idk1 = bArr.readFully(4);
        let idk2 = bArr.readBool();
        this.bot.roomToken1 = bArr.readInt();
        this.bot.roomToken2 = bArr.readInt();

        this.bot.connectionState = ConnectionState.CONNECTED;
        OK(
            "Connect Result",
            `${this.bot.name} connected (${this.bot.internalID + 1}/${
                this.bot.app.bots.length
            })`
        );
    }
}

export class KeepAlive extends Packet {
    constructor(bot: Bot) {
        super(bot, PacketIndex.KEEP_ALIVE);
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeInt(0xfcf869ac)
            .writeInt(this.bot.connectionToken1).data;
        return super.write();
    }
}

export class EnterGameRequest extends Packet {
    playerID: number;
    roomName: string;

    constructor(bot: Bot, playerID: number, roomName: string) {
        super(bot, PacketIndex.ENTER_GAME_REQUEST);
        this.playerID = playerID;
        this.roomName = roomName;
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.connectionToken1)
            .writeInt(0xffffffff)
            .writeUTF(this.roomName)
            .writeInt(this.playerID)
            .writeByte(0xff).data;
        return super.write();
    }
}

export class EmoteRequest extends Packet {
    emoteID: number;

    constructor(bot: Bot, emoteID: number) {
        super(bot, PacketIndex.EMOTE_REQUEST);
        this.emoteID = emoteID;
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeByte(this.emoteID)
            .writeInt(this.bot.connectionToken1)
            .writeInt(0x00000000).data;
        return super.write();
    }
}

export class GameChat extends Packet {
    msg: string;
    playerName: string;
    playerID: number;

    constructor(bot: Bot, data: Buffer | string) {
        let buf = data instanceof Buffer ? data : Buffer.from(data);
        if (typeof data === "string") {
            buf = Buffer.from(data, "utf8");
        }
        super(bot, PacketIndex.GAME_CHAT_MESSAGE, buf);

        this.msg = data instanceof Buffer ? data.toString("utf8") : data;
        this.playerName = "";
        this.playerID = -1;
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        let idk1 = bArr.readInt();
        this.playerName = bArr.readUTF();

        if (this.playerName === this.bot.name) {
            return;
        }

        this.msg = bArr.readUTF();
        this.playerID = bArr.readInt();
        let idk2 = bArr.readBool();
        let idk3 = bArr.readLong();

        this.bot.app.eventListener.onGameChatMessage(this);
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeUTF(this.bot.name)
            .writeUTF(this.msg)
            .writeInt(0xffffffff) // idk
            .writeLong(0x0000000000000000)
            .writeShort(this.bot.name.length)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeShort(0x0000)
            .writeInt(this.bot.connectionToken1).data;

        return super.write();
    }
}

export class ClanChat extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.CLAN_CHAT_MESSAGE, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);

        let playerName = bArr.readUTF();
        let playerMessage = bArr.readUTF();

        let readByte = bArr.readByte();

        if (readByte < 0 || readByte >= Object.keys(ClanRank).length) {
            let enum_u = ClanRank.INVALID;
            readByte = 0;
        }
        let playerClanRank = ClanRank[readByte];
        let playerId = bArr.readInt();

        LOG(
            "Clan Chat",
            `${playerName} (${playerId}, ${playerClanRank}): ${playerMessage}`
        );

        let g = bArr.readLong();
        if (bArr.spaceLeft() > 0) {
            let readByte2 = bArr.readByte();
            let bArr2 = new Array<number>(readByte2);
            let h = bArr;
            if (readByte2 <= 16) {
                bArr.readFully(readByte2);
            } else {
                throw new Error("INVALID ACCOUNT COLORS LENGTH!");
            }
        } else {
            let h = new Array<number>();
        }
        if (bArr.spaceLeft() > 0) {
            let c2 = bArr.readInt();
        }
        if (bArr.spaceLeft() > 0) {
            let i = bArr.readBool();
        }
    }
}

export class EnterGameResult extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.ENTER_GAME_RESULT, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        let result = JoinResults[bArr.readByte()];

        HIGHPRIOLOG("Enter Game Result", `${this.bot.name} -> ${result}`);
    }
}

export class GroupLobbyListResult extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.GROUP_LOBBY_LIST_RESULT, data);
    }

    public parse(): void {
        let worlds: {
            [id: number]: Array<number | string | boolean | number[]>;
        } = {}; // TODO: add interface?

        // results only first page.
        // not gonna bother with pages
        return;

        let bArr = new ByteArray(this.data);

        let bArr1;
        let str;

        let readByte = bArr.readByte(); // entries
        let i = 0;

        for (let i2 = 0; i2 < readByte; i2++) {
            let readInt = bArr.readInt(); // id
            let readByte2 = bArr.readByte();
            let readByte3 = bArr.readByte();
            let readByte4 = bArr.readByte();
            let readByte5 = bArr.readByte();
            let i3 = readByte5 & 3;
            let z = (readByte5 & 4) >>> 2 == 1;
            let z2 = (readByte5 & 8) >>> 3 == 1;
            let z3 = (readByte5 & 16) >>> 4 == 1;
            let m4419c = SplitMultiplier[(readByte5 & 96) >>> 5];
            let z4 = (readByte5 & 128) >>> 7 == 1;
            let readUTF = bArr.readUTF();
            let readByte6 = bArr.readByte();
            let i4 = readByte6 & 7;
            let z5 = (readByte6 & 8) >>> 3 == 1;
            let readInt2 = bArr.readInt();
            let bArr2 = Array<number>(i);

            if (readInt2 != -1) {
                let readUTF2 = bArr.readUTF();
                let bArr3 = Array<number>(bArr.readByte());
                bArr.readFully(bArr3.length);
                str = readUTF2;
                bArr1 = bArr3;
            } else {
                bArr1 = bArr2;
                str = "";
            }
            if (readByte4 >= 0) {
                if (readByte4 < Object.keys(GameMode).length && i3 >= 0) {
                    if (i3 < Object.keys(WorldSize).length) {
                        worlds[readInt] = [
                            readInt,
                            readUTF,
                            readByte2,
                            readByte3,
                            GameMode[readByte4],
                            WorldSize[i3],
                            z,
                            i4,
                            z2,
                            z3,
                            m4419c,
                            readInt2,
                            str,
                            bArr1,
                            z4,
                            z5,
                        ];
                    }
                }
            }
        }

        if (this.bot.internalID === 0) {
            // LOG("GLLR", `Found ${Object.keys(worlds).length} private rooms`);
        }
    }
}

export class ClientPreferences extends Packet {
    player: Player | undefined;

    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.CLIENT_PREFERENCES, data);

        this.player = undefined;
    }

    public parse(): boolean {
        let bArr = new ByteArray(this.data);

        let netID = bArr.readInt();
        let _0x00 = bArr.readShort();

        let playerName = bArr.readUTF();
        let playerID = bArr.readInt();

        this.player = new Player(playerID, playerName, netID);
        this.bot.world.players[netID] = this.player;
        this.bot.app.eventListener.onPlayerJoin(this);

        if (bArr.spaceLeft() > 0) {
            let j = bArr.readByte();
            let k = bArr.readInt();
            if (bArr.spaceLeft() <= 0) {
                return true;
            }
            let readByte = bArr.readByte();
            let bArr1 = new Array(readByte);
            if (readByte <= 16) {
                bArr.readFully(bArr1.length);
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let n = bArr.readByte();
                let o = bArr.readShort();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let q = bArr.readInt();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let p = bArr.readUTF();
                let r = bArr.readByte();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let t = bArr.readInt();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let s = bArr.readByte();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let u = bArr.readLong();
                let v = bArr.readUTF();
                let bArr2 = new Array(bArr.readByte());
                bArr.readFully(bArr2.length);
                let x = bArr.readByte(); // clan status (admin, ...)
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let y = bArr.readByte();
                let z = bArr.readShort();
                let A = bArr.readUTF();
                let B = bArr.readInt();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let C = bArr.readInt();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let D = bArr.readByte();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let d = bArr.readByte(); // enum EnumC6924d1
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let bArr3 = new Array(5);
                for (let i = 0; i < bArr3.length; i++) {
                    bArr3[i] = bArr.readByte();
                }
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let e = bArr.readByte(); // color cycle range
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let h = bArr.readShort();
                let l = bArr.readInt();
                let i = bArr.m1715j(60.0);
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let xtest = bArr.readInt();
                if (bArr.spaceLeft() <= 0) {
                    return true;
                }
                let readByte2 = bArr.readByte();
                let bArr4 = new Array(readByte2);
                if (readByte2 <= 5) {
                    bArr.readFully(bArr4.length);
                    return true;
                }
                throw new Error("INVALID LEVEL COLORS LENGTH!");
            }
            throw new Error("INVALID ALIAS COLORS LENGTH!");
        }

        return true;
    }
}

export class GameData extends Packet {
    player: Player | undefined;

    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.GAME_DATA, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);

        let a = bArr.readInt();
        let readFloat = bArr.readFloat(); // map size

        let playerCount = bArr.readByte();
        let ejectionCount = bArr.readByte();
        let j = bArr.readShort();
        let dotCount = bArr.readShort();
        let m = bArr.readByte();
        let itemCount = bArr.readByte(); // plasma etc.

        for (let i = 0; i < playerCount; i++) {
            let player: { [tag: string]: number | string } = {};
            let id = bArr.readByte();
            player["b"] = bArr.readShort();
            player["e"] = bArr.readByte(); // eject range check
            player["n"] = bArr.readInt();
            player["p"] = bArr.readInt();
            player["h"] = bArr.readByte();
            player["j"] = bArr.readShort();
            player["l"] = bArr.readUTF();
            player["f"] = bArr.readByte(); // hat range check
            player["g"] = bArr.readByte(); // halo range check
            player["i"] = bArr.readByte();
            player["k"] = bArr.readShort();
            player["m"] = bArr.readUTF();
            player["q"] = bArr.readInt();
            player["D"] = bArr.readInt();
            player["E"] = bArr.readByte(); // particle range check
            let bArr1 = bArr.readByte();
            player["F"] = bArr1;
            bArr.readFully(bArr1);
            player["v"] = bArr.readByte(); // cycle type range check
            player["c"] = bArr.readShort();
            player["d"] = bArr.I(0.0, 60.0);
            player["o"] = bArr.readInt();
            player["r"] = bArr.readInt();
            player["s"] = bArr.readByte();
            player["t"] = bArr.readUTF(); // player name
            player["u"] = bArr.readByte(); // font range check
            let bArr2 = bArr.readByte();
            player.w = bArr2;
            if (bArr2 <= 16) {
                bArr.readFully(bArr2); // alias color
                player["x"] = bArr.readInt(); // player id
                player["y"] = bArr.readShort(); // level
                player["z"] = bArr.readUTF(); // clan name
                let bArr3 = bArr.readByte();
                player["A"] = bArr3;
                bArr.readFully(bArr3);
                player["B"] = bArr.readByte(); // clan rank range check
                player["C"] = bArr.readByte(); // click type range check
            } else {
                throw new Error("INVALID ALIAS COLORS LENGTH!");
            }

            this.player = new Player(player["x"], player["t"], id);
            this.player.clan = player["z"];
            this.player.level = player["y"];

            this.bot.world.players[id] = this.player;

            this.bot.app.eventListener.onPlayerJoin(this);
        }

        for (let i = 0; i < ejectionCount; i++) {
            let ejection: { [tag: string]: number } = {};
            let id = bArr.readByte();
            ejection["x"] = bArr.q(0.0, readFloat);
            ejection["y"] = bArr.q(0.0, readFloat);
            ejection["mass"] = bArr.q(0.0, 500000.0);
            this.bot.world.ejections[id] = ejection;
        }

        for (let i = 0; i < dotCount; i++) {
            let dot: { [tag: string]: number } = {};
            let id = j + i;
            dot["x"] = bArr.q(0.0, readFloat);
            dot["y"] = bArr.q(0.0, readFloat);
            this.bot.world.dots[id] = dot;
        }

        for (let i = 0; i < itemCount; i++) {
            let item: { [tag: string]: number | string } = {};
            let id = m + i;
            item["type"] = ItemType[bArr.readByte()];
            item["x"] = bArr.q(0.0, readFloat);
            item["y"] = bArr.q(0.0, readFloat);
            this.bot.world.items[id] = item;
        }
    }
}

export class TopScores extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.TOP_SCORES, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        let roomName = bArr.readUTF();
        let idk1 = bArr.readInt();
        let roomTimeLeft = bArr.readShort(); // 65535-65532, 32767 if no time
        let gameMode = GameMode[bArr.readByte()];
        let roomSize = WorldSize[(bArr.readByte() & 12) >> 2];
        let maxPlayers = bArr.readByte();
        let amountPlayers = bArr.readByte(); // excludes spectators

        let amountSpectators = bArr.data[bArr.data.length - 13] / 2;

        this.bot.world.name = roomName;
        this.bot.world.timeLeft = roomTimeLeft;
        this.bot.world.gameMode = gameMode;
        this.bot.world.size = roomSize;
        this.bot.world.maxPlayers = maxPlayers;
        this.bot.world.amountPlayers = amountPlayers;
        this.bot.world.amountSpectators = amountSpectators;
    }
}

export class GameUpdate extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.GAME_UPDATE, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        bArr.readByte(); // ff

        let tick = bArr.readByte();

        // 0.0, large map size
        let love = bArr.q(0.0, 844.1067504882812);

        let oo = bArr.D(); // % 256 and > 0 check OR > Byte.MAX_VALUE check
        let po = (bArr.readByte() + 128) % 256;
        let qo = (bArr.readByte() + 128) % 256;
        let uo = bArr.readByte();
        let readByte = bArr.readByte();
        let i9 = 0;
        let ko = readByte & 31;
        let io = (readByte & 224) >> 5;
        let wo = bArr.readByte();
        let lo = (bArr.readByte() + 128) % 256;
        let to = bArr.readByte();
        let vo = bArr.readByte();
        let readByte2 = bArr.readByte();
        let so = readByte2 & 31;
        let jo = (readByte2 & 224) >> 5;
        let readByte3 = bArr.readByte();
        let xo = readByte3 & 31;
        let yo = (readByte3 & 224) >> 5;
        let mo = (bArr.readByte() + 128) % 256;
        let ro = bArr.readByte();

        if (io > 0) {
            let c = new Array<number>(io);
            let d = new Array<number>(io);
            let e = new Array<number>(io);
            for (let i11 = 0; i11 < io; i11++) {
                c[i11] = bArr.readByte();
                d[i11] = bArr.q(0.0, love);
                e[i11] = bArr.q(0.0, love);
            }
        }

        // ejections
        if (wo > 0) {
            let l = new Array<number>(wo); // id, max. 91
            let m = new Array<number>(wo); // player index
            let n = new Array<number>(wo); // x
            let o = new Array<number>(wo); // y
            let q = new Array<number>(wo); // angle
            let p = new Array<number>(wo); // mass
            for (let i13 = 0; i13 < wo; i13++) {
                let readByte4 = bArr.readByte();
                let z8 = (readByte4 & 1) === 1;
                l[i13] = (readByte4 & 254) >> 1;
                m[i13] = bArr.readByte();
                n[i13] = bArr.q(0.0, love);
                o[i13] = bArr.q(0.0, love);
                p[i13] = bArr.n(0.0, 6.2831855);
                if (!z8) {
                    q[i13] = bArr.q(0.0, 500000.0);
                    let ej: { [tag: string]: number } = {};
                    ej["player"] = m[i13];
                    ej["x"] = n[i13];
                    ej["y"] = o[i13];
                    ej["angle"] = q[i13];
                    ej["mass"] = p[i13];
                    for (let bot of this.bot.app.bots) {
                        bot.world.ejections[l[i13]] = ej;
                    }
                } else {
                    // ej del
                    q[i13] = Number.NEGATIVE_INFINITY;
                    for (let bot of this.bot.app.bots) {
                        if (bot.world.ejections[l[i13]]) {
                            delete bot.world.ejections[l[i13]];
                        }
                    }
                }
            }
        }

        // ejection move
        if (vo > 0) {
            let r = new Array<number>(vo); // id, max. 91
            let s = new Array<number>(vo); // x
            let t = new Array<number>(vo); // y
            for (let i15 = 0; i15 < vo; i15++) {
                r[i15] = bArr.readByte();
                s[i15] = bArr.q(0.0, love);
                t[i15] = bArr.q(0.0, love);

                for (let bot of this.bot.app.bots) {
                    if (bot.world.ejections[r[i15]]) {
                        let ej: { [tag: string]: number } =
                            bot.world.ejections[r[i15]];
                        ej["x"] = s[i15];
                        ej["y"] = t[i15];
                    }
                }
            }
        }

        // dots
        if (lo > 0) {
            let u = new Array<number>(lo); // id
            let v = new Array<number>(lo); // x
            let w = new Array<number>(lo); // y
            for (let i17 = 0; i17 < lo; i17++) {
                u[i17] = bArr.readShort();
                v[i17] = bArr.q(0.0, love);
                w[i17] = bArr.q(0.0, love);

                for (let bot of this.bot.app.bots) {
                    let dot: { [tag: string]: number } = {};
                    if (bot.world.dots[u[i17]]) {
                        dot = bot.world.dots[u[i17]];
                    } else {
                        dot = {};
                    }
                    dot["x"] = v[i17];
                    dot["y"] = w[i17];
                }
            }
        }

        // items
        if (so > 0) {
            let x = new Array<number>(so); // id
            let y = new Array<number>(so); // type
            let z = new Array<number>(so); // x
            let A = new Array<number>(so); // y

            for (let i19 = 0; i19 < so; i19++) {
                x[i19] = bArr.readByte();
                y[i19] = bArr.readByte();
                z[i19] = bArr.q(0.0, love);
                A[i19] = bArr.q(0.0, love);

                for (let bot of this.bot.app.bots) {
                    let item: { [tag: string]: number | string } = {};
                    if (bot.world.items[x[i19]]) {
                        item = bot.world.items[x[i19]];
                    } else {
                        item = {};
                        bot.world.items[x[i19]] = item;
                    }

                    item["type"] = ItemType[y[i19]];
                    item["x"] = z[i19];
                    item["y"] = A[i19];
                }
            }
        }

        // holes
        if (to > 0) {
            let B = new Array<number>(to); // id
            let C = new Array<number>(to); // type
            let D = new Array<number>(to); // x
            let E = new Array<number>(to); // y
            let F = new Array<number>(to); // size (0 = del)
            for (let i21 = 0; i21 < to; i21++) {
                let readByte5 = bArr.readByte();
                C[i21] = readByte5 & 3;
                B[i21] = (readByte5 & 252) >> 2;
                D[i21] = bArr.q(0.0, love);
                E[i21] = bArr.q(0.0, love);
                F[i21] = bArr.I(0.0, 62.6);

                let hole: { [tag: string]: number | string } = {};
                hole["type"] = HoleType[C[i21]];
                hole["x"] = D[i21];
                hole["y"] = E[i21];
                hole["size"] = F[i21];

                if (F[i21] === 0) {
                    // delete in fov only
                    delete this.bot.world.holes[B[i21]];
                } else {
                    for (let bot of this.bot.app.bots) {
                        bot.world.holes[B[i21]] = hole;
                    }
                }
            }
        }

        if (jo > 0) {
            let f = new Array<number>(jo);
            let g = new Array<number>(jo);
            let h = new Array<number>(jo);
            let i = new Array<number>(jo);
            let j = new Array<number>(jo);
            for (let i23 = 0; i23 < jo; i23++) {
                f[i23] = bArr.readByte();
                g[i23] = bArr.q(0.0, love);
                h[i23] = bArr.q(0.0, love);
                i[i23] = bArr.q(0.0, love);
                j[i23] = bArr.n(0.0, 1.0);
            }
        }

        // players
        let P = new Array<number>(); // ?
        let Q = new Array<number>(); // ?
        let R = new Array<number>(); // blob x
        let S = new Array<number>(); // blob y
        let T = new Array<number>(); // blob mass
        if (uo > 0) {
            let K = new Array<number>(uo); // id
            let L = new Array<number>(uo); // recombine time
            let M = new Array<number>(uo); // ?
            let N = new Array<number>(uo); // blob count

            for (let i25 = 0; i25 < uo; i25++) {
                K[i25] = bArr.readByte();
                let readByte6 = bArr.readByte();
                L[i25] = readByte6 & 127;
                if ((readByte6 & 128) >> 7 !== 0) {
                    M[i25] = bArr.readByte();
                } else {
                    M[i25] = 0x00;
                }
                let readByte7 = bArr.readByte();

                // 31 = max x16, 63 = max x32, 95 = max x64
                N[i25] = (readByte7 & 31) | (readByte7 & 63) | (readByte7 & 95);

                let players: Player[] = [];

                for (let bot of this.bot.app.bots) {
                    if (bot.world.players[K[i25]]) {
                        players.push(bot.world.players[K[i25]]);
                    } else {
                        players.push(new Player(K[i25], "NULL", K[i25]));
                    }
                }

                for (let player of players) {
                    player.recombineTime = L[i25];
                    player.blobs = {};
                }

                for (let i26 = 0; i26 < N[i25]; i26++) {
                    let readByte8 = bArr.readByte();
                    let z9 = (readByte8 & 1) === 1;
                    let z10 = (readByte8 & 2) >> 1 === 1;
                    // pushin P (XDDDD)
                    P.push((readByte8 & 252) >> 2);

                    if (z9) {
                        Q.push(bArr.readShort());
                    } else {
                        Q.push(0x0000);
                    }

                    R.push(bArr.q(0.0, love));
                    S.push(bArr.q(0.0, love));

                    if (!z10) {
                        T.push(bArr.q(0.0, 500000.0));
                    } else {
                        T.push(Number.NEGATIVE_INFINITY);
                    }

                    let blob: { [tag: string]: number } = {
                        x: R[R.length - 1],
                        y: S[S.length - 1],
                        mass: T[T.length - 1],
                    };

                    for (let player of players) {
                        player.blobs[P[P.length - 1]] = blob;
                    }
                }
            }
        }

        if (ro > 0) {
            let G = new Array<number>(ro);
            let H = new Array<boolean>(ro);
            let I = new Array<number>(ro);
            let J = new Array<number>(ro);
            let K = new Array<number>(ro);
            for (let i28 = 0; i28 < ro; i28++) {
                let readByte8 = bArr.readByte();
                G[i28] = readByte8 & 127;
                H[i28] = (readByte8 & 128) >> 7 !== 0;
                I[i28] = bArr.q(0.0, love);
                J[i28] = bArr.q(0.0, love);
                K[i28] = bArr.n(0.0, Math.sqrt(2000)); // orig: .g(2000.0f);
            }
        }

        // spells
        if (xo > 0) {
            let T = new Array<number>(xo); // id
            let U = new Array<number>(xo); // type
            let V = new Array<number>(xo); // status
            let W = new Array<number>(xo); // x
            let X = new Array<number>(xo); // y

            for (let i30 = 0; i30 < xo; i30++) {
                T[i30] = bArr.readByte();
                let readByte9 = bArr.readByte();
                V[i30] = readByte9 & 3;
                U[i30] = (readByte9 & 252) >> 2;

                if (U[i30] < 0 || U[i30] >= Object.keys(SpellType).length) {
                    // case unknown ordinal, orig: (bArr[i30] >= c2.b.J.length)
                    U[i30] = SpellType.UNKNOWN;
                }
                W[i30] = bArr.q(0.0, love);
                X[i30] = bArr.q(0.0, love);

                let spell: { [tag: string]: number | string } = {};

                for (let bot of this.bot.app.bots) {
                    if (bot.world.spells[T[i30]]) {
                        spell = bot.world.spells[T[i30]];
                    } else {
                        spell = {};
                        bot.world.spells[T[i30]] = spell;
                        spell["type"] = SpellType[U[i30]];
                    }

                    spell["status"] = V[i30];
                    spell["x"] = W[i30];
                    spell["y"] = X[i30];
                }
            }
        }

        // walls
        if (yo > 0) {
            let Y = new Array<number>(yo);
            let Z = new Array<number>(yo);
            let ao = new Array<number>(yo);
            let bo = new Array<number>(yo);
            let co = new Array<number>(yo);
            for (let i32 = 0; i32 < yo; i32++) {
                Y[i32] = bArr.readByte();
                Z[i32] = bArr.q(0.0, love);
                ao[i32] = bArr.q(0.0, love);
                bo[i32] = bArr.q(0.0, love);
                co[i32] = bArr.q(0.0, love);
            }
        }

        if (mo > 0) {
            let d0 = new Array<number>(mo);
            let eo = new Array<number>(mo);
            let fo = new Array<number>(mo);
            for (let i34 = 0; i34 < mo; i34++) {
                d0[i34] = (bArr.readByte() + 128) & 256;
                eo[i34] = (bArr.readByte() + 128) & 256;
                fo[i34] = bArr.readByte();
            }
        }

        // only in FOV
        let r2 = ko; // (r0.f31896k0)

        // NOTE: ... "// ? 60 incorrect? ignore for now"
        //       ... haven't spent time reversing this yet

        if (r2 > 0) {
            r2 = bArr.readByte(); // L4cd, line 3
            let event = BaseEvents[r2];

            switch (r2) {
                case BaseEvents.UNKNOWN:
                    break;
                case BaseEvents.EAT_DOTS:
                    break;
                case BaseEvents.EAT_BLOB:
                    break;
                case BaseEvents.EAT_SMBH:
                    break;
                case BaseEvents.BLOB_EXPLODE:
                    let L830_r2 = bArr.readByte();
                    let L830_r3 = bArr.readByte();
                    break;
                case BaseEvents.BLOB_LOST:
                    break;
                case BaseEvents.EJECT:
                    let L814_r2 = bArr.readByte();
                    let L814_r3 = bArr.readByte();
                    break;
                case BaseEvents.SPLIT:
                    let L806_r2 = bArr.readByte(); // player id

                    let pl: Player = this.bot.world.players[L806_r2];
                    if (pl) {
                        pl.isSplitting = true;
                        // ! ... REVERT SPLIT STATE MANUALLY!
                        // ! ... FUNCTION MUST REACT TO THIS ACCORDINGLY.

                        // fallback if not reacted to
                        setTimeout(() => (pl.isSplitting = false), 250);
                    }

                    break;
                case BaseEvents.RECOMBINE:
                    let L7f8_r2 = bArr.readByte();
                    break;
                case BaseEvents.TIMER_WARNING:
                    break;
                case BaseEvents.CTF_SCORE:
                    break;
                case BaseEvents.CTF_FLAG_RETURNED:
                    break;
                case BaseEvents.CTF_FLAG_STOLEN:
                    break;
                case BaseEvents.ACHIEVEMENT_EARNED:
                    let L7bd_r2 = bArr.readShort();
                    break;
                case BaseEvents.XP_GAINED:
                    break;
                case BaseEvents.UNUSED_2:
                    break;
                case BaseEvents.XP_SET:
                    let L79b_r11 = bArr.readLong();
                    let L79b_r13 = bArr.readByte();
                    let L79b_r14 = bArr.readInt();
                    let L79b_r15 = bArr.readByte();
                    let L79b_r16 = bArr.D();
                    break;
                case BaseEvents.DQ_SET:
                    let L788_r2 = bArr.readByte();
                    let L788_r3 = bArr.readBool();
                    break;
                case BaseEvents.DQ_COMPLETED:
                    let L779_r2 = bArr.readByte();
                    break;
                case BaseEvents.DQ_PROGRESS:
                    let L76a_r2 = bArr.readShort();
                    break;
                case BaseEvents.EAT_SERVER_BLOB:
                    break;
                case BaseEvents.EAT_SPECIAL_OBJECTS:
                    let L743_r2 = bArr.readByte();
                    let L743_r3 = bArr.readByte();
                    break;
                case BaseEvents.SO_SET:
                    let L730_r2 = bArr.readByte();
                    let L730_r3 = bArr.readInt();
                    break;
                case BaseEvents.LEVEL_UP:
                    let L721_r2 = bArr.readShort();
                    break;
                case BaseEvents.ARENA_RANK_ACHIEVED:
                    let L70e_r2 = bArr.readByte();
                    let L70e_r3 = bArr.readByte();
                    break;
                case BaseEvents.DOM_CP_LOST:
                    break;
                case BaseEvents.DOM_CP_GAINED:
                    break;
                case BaseEvents.UNUSED_1:
                    break;
                case BaseEvents.CTF_GAINED:
                    break;
                case BaseEvents.GAME_OVER:
                    break;
                case BaseEvents.BLOB_STATUS:
                    let L6d6_r2 = bArr.readByte();
                    let L6d6_r3 = bArr.readByte();
                    let L6d6_r5 = bArr.readShort();
                    break;
                case BaseEvents.TELEPORT:
                    let L6c7_r2 = bArr.readByte();
                    break;
                case BaseEvents.SHOOT:
                    let L6b0_r2 = bArr.readByte();
                    let L6b0_r3 = bArr.readByte();
                    let L6b0_r4 = bArr.readByte();
                    break;
                case BaseEvents.CLAN_WAR_WON:
                    let L6a1_r2 = bArr.readShort();
                    break;
                case BaseEvents.PLASMA_REWARD:
                    let L68e_r2 = bArr.D();
                    let L68e_r5 = bArr.readByte();
                    break;
                case BaseEvents.EMOTE:
                    let L673_r2 = bArr.readByte();
                    let L673_r3 = bArr.readByte();
                    let L673_r5 = bArr.readByte(); // emote index
                    let L673_r9 = bArr.readInt();
                    this.bot.emote(L673_r5); // mimic for the funnies
                    break;
                case BaseEvents.END_MISSION:
                    let L653_r13 = bArr.readByte();
                    let L653_r14 = bArr.readBool();
                    let L653_r15 = bArr.readByte();
                    let L653_r16 = bArr.D();
                    let L653_r17 = bArr.readShort();
                    break;
                case BaseEvents.XP_GAINED_2:
                    let L63b_r2 = bArr.D();
                    let L63b_r5 = bArr.m1715j(60.0); // ? 60 incorrect? ignore for now
                    let L63b_r9 = bArr.D();
                    break;
                case BaseEvents.EAT_CAKE:
                    let L628_r2 = bArr.D();
                    let L628_r3 = bArr.D();
                    break;
                case BaseEvents.COIN_COUNT:
                    let L615_r2 = bArr.readByte();
                    let L615_r3 = bArr.readShort();
                    break;
                case BaseEvents.CLEAR_EFFECTS:
                    break;
                case BaseEvents.SPEED:
                    let L5fb_r2 = bArr.readShort();
                    break;
                case BaseEvents.TRICK:
                    let L5e4_r2 = bArr.readByte();
                    let L5e4_r3 = bArr.readShort();
                    let L5e4_r5 = bArr.D();
                    break;
                case BaseEvents.DESTROY_ASTEROID:
                    break;
                case BaseEvents.ACCOLADE:
                    let L5c9_r2 = bArr.readByte();
                    break;
                case BaseEvents.INVIS:
                    let L5ba_r2 = bArr.readShort();
                    break;
                case BaseEvents.KILLED_BY:
                    let L5ab_r2 = bArr.readByte();
                    break;
                case BaseEvents.RADIATION_CLOUD:
                    let L58a_r2 = bArr.readByte();
                    // ? let L58a_r3 = r0.f31890h0
                    let L58a_r3 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    // ? let L58a_r5 = r0.f31890h0
                    let L58a_r5 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L58a_r9 = bArr.m1718a(0.0, 60.0); // ? 60 incorrect? ignore for now
                    break;
                case BaseEvents.CHARGE:
                    let L56a_r2 = bArr.readByte();
                    let L56a_r3 = bArr.readByte();
                    break;
                case BaseEvents.LP_COUNT:
                    let L55b_r2 = bArr.readByte();
                    break;
                case BaseEvents.BR_BOUNDS:
                    let L51f_r10 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r11 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r12 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r13 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r14 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r15 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r16 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    let L51f_r17 = bArr.m1717b(60.0); // ? 60 incorrect? ignore for now
                    break;
                case BaseEvents.MINIMAP:
                    break;
                case BaseEvents.RLGL_DEATH:
                    break;
                case BaseEvents.RLGL_STATE:
                    let L4ed_r5 = bArr.readByte();
                    break;
                default:
                    // goto to UNKNOWN
                    break;
            }
        }

        // ... w0
    }
}

export class PacketControl extends Packet {
    angle: number;
    speed: number;
    split: boolean;
    eject: boolean;
    drop: boolean;

    constructor(
        bot: Bot,
        angle: number,
        speed: number,
        split: boolean = false,
        eject: boolean = false,
        drop: boolean = false
    ) {
        super(bot, PacketIndex.CONTROL);
        this.angle = angle; // 0.0 to 2pi
        this.speed = speed; // 0.0 to 1.0
        this.split = split;
        this.eject = eject;
        this.drop = drop;
    }

    public blobPatrol(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        if (this.speed > 1) {
            this.speed = 1;
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
        while (this.angle < 0) {
            this.angle += 2 * Math.PI;
        }
        while (this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }

        let angle = (this.angle * 65535) / (2 * Math.PI);
        let speed = this.speed * 255;

        let data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeShort(angle)
            .writeByte(speed)
            .writeByte(0x0f);

        let button = 0;
        if (this.split) {
            button |= 0x01;
        }
        if (this.eject) {
            button |= 0x02;
        }
        if (this.drop) {
            button |= 0x08;
        }
        this.data = data
            .writeByte(button)
            .writeByte(0xff)
            .writeInt(this.bot.connectionToken1)
            .writeByte(0x63).data;

        return super.write();
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        if (this.speed > 1) {
            this.speed = 1;
        }
        if (this.speed < 0) {
            this.speed = 0;
        }
        while (this.angle < 0) {
            this.angle += 2 * Math.PI;
        }
        while (this.angle >= 2 * Math.PI) {
            this.angle -= 2 * Math.PI;
        }

        let angle = (this.angle * 65535) / (2 * Math.PI);
        let speed = this.speed * 255;

        let data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeShort(angle)
            .writeByte(speed)
            .writeByte(0x00);

        let button = 0;
        if (this.split) {
            button |= 0x01;
        }
        if (this.eject) {
            button |= 0x02;
        }
        if (this.drop) {
            button |= 0x08;
        }
        this.data = data
            .writeByte(button)
            .writeByte(0x02)
            .writeInt(this.bot.connectionToken1).data;

        return super.write();
    }
}

export class GroupLobbyCreateRequest extends Packet {
    props: WorldProps;

    constructor(bot: Bot, props: WorldProps) {
        super(bot, PacketIndex.GROUP_LOBBY_CREATE_REQUEST);
        this.props = props;
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        let data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeBool(this.props.hidden ?? true)
            .writeByte(this.props.maxPlayers ?? 8)
            .writeByte(this.props.minPlayers ?? 2)
            .writeByte(this.props.gameMode ?? GameMode.FFA_ULTRA)
            .writeByte(this.props.worldSize ?? WorldSize.TINY)
            .writeByte(0x02) // ? ord?
            .writeByte(this.props.difficulty ?? Difficulty.EASY)
            .writeUTF(this.props.roomName ?? this.bot.name)
            .writeUTF(this.bot.name)
            .writeFloat(0x417a6666) // ?
            .writeShort(0x00a8) // ?
            .writeShort(this.props.duration ?? 0x7fff)
            .writeBool(this.props.mayhem ?? false)
            .writeByte(0x09); // len bArr2, static

        for (let i = 0; i < 0x09; i++) {
            data.writeByte(0xff);
        }

        data.writeByte(0x17);

        // items enabled in mayhem
        let itemAmount = 0x17;
        for (let i = 0; i < itemAmount; i++) {
            data.writeBool(false);
        }

        this.data = data
            .writeByte(0x00) // ? ord?
            .writeByte(this.props.splitMultiplier ?? SplitMultiplier.X64)
            .writeBool(this.props.allowUltraclick ?? false)
            .writeBool(this.props.allowMassBoost ?? false)
            .writeByte(0x00)
            .writeInt(this.bot.connectionToken1)
            .writeBool(this.props.rainbowHoles ?? true)
            .writeByte(this.props.walls ?? 0x00)
            .writeBool(this.props.admin ?? false)
            .writeBool(this.props.guests ?? true)
            .writeBool(this.props.arena ?? false).data; // probably arena

        return super.write();
    }
}

export class BattleRoyaleAction extends Packet {
    constructor(bot: Bot) {
        super(bot, PacketIndex.BATTLE_ROYALE_ACTION);
    }

    public write(): Buffer {
        if (
            !this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2
        ) {
            return super.write();
        }
        this.data = new ByteArray()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeByte(0x01).data;

        return super.write();
    }
}

export class BattleRoyaleStatusUpdate extends Packet {
    constructor(bot: Bot, data: Buffer) {
        super(bot, PacketIndex.BATTLE_ROYALE_STATUS_UPDATE, data);
    }

    public parse(): void {
        let bArr = new ByteArray(this.data);
        let idk1 = bArr.readByte(); // ? only seen 0x02 yet
        let amountRegistrants = bArr.readByte();

        for (let bot of this.bot.app.bots) {
            bot.BRRegistrants = amountRegistrants;
        }
    }
}

export const __PACKETS__: { [id: number]: any } = {
    0x69: SessionStats,
    0x07: Disconnect,
    0x0a: JoinRequest,
    0x06: ConnectRequest,
    0x01: ConnectResult2,
    0x03: KeepAlive,
    0x28: EnterGameRequest,
    0x61: EmoteRequest,
    0x08: GameChat,
    0x0f: ClientPreferences,
    0x4b: GameData,
    0x14: TopScores,
    0x16: GameUpdate,
    0x02: PacketControl,
    0x1b: GroupLobbyCreateRequest,
    0x6f: BattleRoyaleAction,
    0x72: BattleRoyaleStatusUpdate,
    0xb: JoinResult,
    0x29: EnterGameResult,
    0x09: ClanChat,
    0x18: GroupLobbyListResult,
};
