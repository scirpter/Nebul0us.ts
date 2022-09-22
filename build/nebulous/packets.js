"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.__PACKETS__ = exports.BattleRoyaleStatusUpdate = exports.BattleRoyaleAction = exports.GroupLobbyCreateRequest = exports.PacketControl = exports.GameUpdate = exports.TopScores = exports.GameData = exports.ClientPreferences = exports.GroupLobbyListResult = exports.EnterGameResult = exports.ClanChat = exports.GameChat = exports.EmoteRequest = exports.EnterGameRequest = exports.KeepAlive = exports.ConnectResult2 = exports.ConnectRequest = exports.JoinResult = exports.JoinRequest = exports.Disconnect = exports.SessionStats = exports.Packet = void 0;
const all_1 = require("./enums/all");
const player_1 = __importDefault(require("./models/player"));
const bytearray_1 = __importDefault(require("../models/bytearray"));
const cnsl_1 = require("../models/cnsl");
class Packet {
    constructor(bot, packetIndex, data = Buffer.alloc(0)) {
        this.data = Buffer.alloc(0);
        this.bot = bot;
        this.packetIndex = packetIndex;
        this.data = data;
    }
    write() {
        return Buffer.from(new bytearray_1.default()
            .writeByte(this.packetIndex.valueOf())
            .writeRaw(this.data).data);
    }
}
exports.Packet = Packet;
class SessionStats extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.SESSION_STATS, data);
    }
    parse() {
        this.bot.app.eventListener.onBotDeath(this);
    }
}
exports.SessionStats = SessionStats;
class Disconnect extends Packet {
    constructor(bot) {
        super(bot, all_1.PacketIndex.DISCONNECT);
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeInt(this.bot.connectionToken1).data;
        return super.write();
    }
}
exports.Disconnect = Disconnect;
class JoinRequest extends Packet {
    constructor(bot) {
        super(bot, all_1.PacketIndex.JOIN_REQUEST);
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeShort(this.bot.app.skinIndex)
            .writeUTF(this.bot.name)
            .writeShort(0xff00)
            .writeInt(this.bot.name.length)
            .writeShort(0xffff)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeHex("e1d4520000ff0000000000ff00000000000000000000ff0005000000000000000000")
            .writeInt(0x00000000)
            .writeInt(this.bot.connectionToken1)
            .writeHex("7777777777").data;
        return super.write();
    }
}
exports.JoinRequest = JoinRequest;
class JoinResult extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.JOIN_RESULT, data);
        this.netID = 0;
        this.playerName = "";
        this.roomToken2 = 0x00000000;
        this.clickType = all_1.ClickType[all_1.ClickType.NORMAL];
        this.clanRank = all_1.ClanRank[all_1.ClanRank.INVALID];
        this.nameFont = all_1.NameFonts[all_1.NameFonts.DEFAULT];
        this.colorCycle = all_1.ColorCycle[all_1.ColorCycle.NONE];
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        this.roomToken2 = bArr.readInt();
        bArr.readByte();
        this.netID = bArr.readByte();
        let s = bArr.readShort();
        let i5 = bArr.readInt();
        let n2 = bArr.readByte();
        this.playerName = bArr.readUTF();
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
        this.clickType = all_1.ClickType[bArr.readByte()];
        let i11 = bArr.readInt();
        this.clanRank = all_1.ClanRank[bArr.readByte()];
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
        this.nameFont = all_1.NameFonts[bArr.readByte()];
        let bArr3_firstByte = bArr.readByte();
        this.colorCycle = all_1.ColorCycle[bArr.readByte()];
        let s2 = bArr.readShort();
        let m1707q_funcResult = bArr.readShort();
        let i4 = bArr.readInt();
        let bArr3Len = bArr.readByte();
        let bArr3 = bArr.readFully(bArr3Len);
        let i9 = bArr.readByte();
    }
}
exports.JoinResult = JoinResult;
class ConnectRequest extends Packet {
    constructor(bot, gameMode = all_1.GameMode.FFA_ULTRA, mayhem = false, searchPrivate = true) {
        super(bot, all_1.PacketIndex.CONNECT_REQUEST);
        this.gameMode = gameMode;
        this.searchPrivate = searchPrivate;
        this.mayhem = mayhem;
    }
    write() {
        if (!this.bot.connectionToken1 || !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(0x00000000)
            .writeInt(this.bot.connectionToken1)
            .writeByte(this.gameMode)
            .writeBool(this.searchPrivate)
            .writeInt(0xffffffff)
            .writeUTF(this.bot.token)
            .writeByte(all_1.PlayerVisibility.APPEAR_OFFLINE)
            .writeShort(0x0445)
            .writeBool(this.mayhem)
            .writeShort(this.bot.app.skinIndex)
            .writeUTF(this.bot.name)
            .writeByte(0xff)
            .writeInt(0x00000000)
            .writeByte(this.bot.name.length)
            .writeShort(0xffff)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeHex("e1d4520000ff0000000000ff00000000000000000000ff000577777777770000000000000000000000017bf8")
            .writeInt(this.bot.connectionToken2).data;
        return super.write();
    }
}
exports.ConnectRequest = ConnectRequest;
class ConnectResult2 extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.CONNECT_RESULT_2, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let idk1 = bArr.readFully(4);
        let idk2 = bArr.readBool();
        this.bot.roomToken1 = bArr.readInt();
        this.bot.roomToken2 = bArr.readInt();
        this.bot.connectionState = all_1.ConnectionState.CONNECTED;
        (0, cnsl_1.OK)("Connect Result", `${this.bot.name} connected (${this.bot.internalID + 1}/${this.bot.app.bots.length})`);
    }
}
exports.ConnectResult2 = ConnectResult2;
class KeepAlive extends Packet {
    constructor(bot) {
        super(bot, all_1.PacketIndex.KEEP_ALIVE);
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeInt(0xfcf869ac)
            .writeInt(this.bot.connectionToken1).data;
        return super.write();
    }
}
exports.KeepAlive = KeepAlive;
class EnterGameRequest extends Packet {
    constructor(bot, playerID, roomName) {
        super(bot, all_1.PacketIndex.ENTER_GAME_REQUEST);
        this.playerID = playerID;
        this.roomName = roomName;
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.connectionToken1)
            .writeInt(0xffffffff)
            .writeUTF(this.roomName)
            .writeInt(this.playerID)
            .writeByte(0xff).data;
        return super.write();
    }
}
exports.EnterGameRequest = EnterGameRequest;
class EmoteRequest extends Packet {
    constructor(bot, emoteID) {
        super(bot, all_1.PacketIndex.EMOTE_REQUEST);
        this.emoteID = emoteID;
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeByte(this.emoteID)
            .writeInt(this.bot.connectionToken1)
            .writeInt(0x00000000).data;
        return super.write();
    }
}
exports.EmoteRequest = EmoteRequest;
class GameChat extends Packet {
    constructor(bot, data) {
        let buf = data instanceof Buffer ? data : Buffer.from(data);
        if (typeof data === "string") {
            buf = Buffer.from(data, "utf8");
        }
        super(bot, all_1.PacketIndex.GAME_CHAT_MESSAGE, buf);
        this.msg = data instanceof Buffer ? data.toString("utf8") : data;
        this.playerName = "";
        this.playerID = -1;
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
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
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeUTF(this.bot.name)
            .writeUTF(this.msg)
            .writeInt(0xffffffff)
            .writeLong(0x0000000000000000)
            .writeShort(this.bot.name.length)
            .writeRaw(Buffer.alloc(this.bot.name.length, 0xff))
            .writeShort(0x0000)
            .writeInt(this.bot.connectionToken1).data;
        return super.write();
    }
}
exports.GameChat = GameChat;
class ClanChat extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.CLAN_CHAT_MESSAGE, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let playerName = bArr.readUTF();
        let playerMessage = bArr.readUTF();
        let readByte = bArr.readByte();
        if (readByte < 0 || readByte >= Object.keys(all_1.ClanRank).length) {
            let enum_u = all_1.ClanRank.INVALID;
            readByte = 0;
        }
        let playerClanRank = all_1.ClanRank[readByte];
        let playerId = bArr.readInt();
        (0, cnsl_1.LOG)("Clan Chat", `${playerName} (${playerId}, ${playerClanRank}): ${playerMessage}`);
        let g = bArr.readLong();
        if (bArr.spaceLeft() > 0) {
            let readByte2 = bArr.readByte();
            let bArr2 = new Array(readByte2);
            let h = bArr;
            if (readByte2 <= 16) {
                bArr.readFully(readByte2);
            }
            else {
                throw new Error("INVALID ACCOUNT COLORS LENGTH!");
            }
        }
        else {
            let h = new Array();
        }
        if (bArr.spaceLeft() > 0) {
            let c2 = bArr.readInt();
        }
        if (bArr.spaceLeft() > 0) {
            let i = bArr.readBool();
        }
    }
}
exports.ClanChat = ClanChat;
class EnterGameResult extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.ENTER_GAME_RESULT, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let result = all_1.JoinResults[bArr.readByte()];
        (0, cnsl_1.HIGHPRIOLOG)("Enter Game Result", `${this.bot.name} -> ${result}`);
    }
}
exports.EnterGameResult = EnterGameResult;
class GroupLobbyListResult extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.GROUP_LOBBY_LIST_RESULT, data);
    }
    parse() {
        let worlds = {};
        return;
        let bArr = new bytearray_1.default(this.data);
        let bArr1;
        let str;
        let readByte = bArr.readByte();
        let i = 0;
        for (let i2 = 0; i2 < readByte; i2++) {
            let readInt = bArr.readInt();
            let readByte2 = bArr.readByte();
            let readByte3 = bArr.readByte();
            let readByte4 = bArr.readByte();
            let readByte5 = bArr.readByte();
            let i3 = readByte5 & 3;
            let z = (readByte5 & 4) >>> 2 == 1;
            let z2 = (readByte5 & 8) >>> 3 == 1;
            let z3 = (readByte5 & 16) >>> 4 == 1;
            let m4419c = all_1.SplitMultiplier[(readByte5 & 96) >>> 5];
            let z4 = (readByte5 & 128) >>> 7 == 1;
            let readUTF = bArr.readUTF();
            let readByte6 = bArr.readByte();
            let i4 = readByte6 & 7;
            let z5 = (readByte6 & 8) >>> 3 == 1;
            let readInt2 = bArr.readInt();
            let bArr2 = Array(i);
            if (readInt2 != -1) {
                let readUTF2 = bArr.readUTF();
                let bArr3 = Array(bArr.readByte());
                bArr.readFully(bArr3.length);
                str = readUTF2;
                bArr1 = bArr3;
            }
            else {
                bArr1 = bArr2;
                str = "";
            }
            if (readByte4 >= 0) {
                if (readByte4 < Object.keys(all_1.GameMode).length && i3 >= 0) {
                    if (i3 < Object.keys(all_1.WorldSize).length) {
                        worlds[readInt] = [
                            readInt,
                            readUTF,
                            readByte2,
                            readByte3,
                            all_1.GameMode[readByte4],
                            all_1.WorldSize[i3],
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
        }
    }
}
exports.GroupLobbyListResult = GroupLobbyListResult;
class ClientPreferences extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.CLIENT_PREFERENCES, data);
        this.player = undefined;
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let netID = bArr.readInt();
        let _0x00 = bArr.readShort();
        let playerName = bArr.readUTF();
        let playerID = bArr.readInt();
        this.player = new player_1.default(playerID, playerName, netID);
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
                let x = bArr.readByte();
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
                let d = bArr.readByte();
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
                let e = bArr.readByte();
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
exports.ClientPreferences = ClientPreferences;
class GameData extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.GAME_DATA, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let a = bArr.readInt();
        let mapSize = bArr.readFloat();
        let playerct = bArr.readByte();
        let ejectionCount = bArr.readByte();
        let staticDotStartID = bArr.readShort();
        let dotct = bArr.readShort();
        let staticItemStartID = bArr.readByte();
        let itemCount = bArr.readByte();
        for (let i = 0; i < playerct; i++) {
            let player = {};
            let id = bArr.readByte();
            player["b"] = bArr.readShort();
            player["e"] = bArr.readByte();
            player["n"] = bArr.readInt();
            player["p"] = bArr.readInt();
            player["h"] = bArr.readByte();
            player["j"] = bArr.readShort();
            player["l"] = bArr.readUTF();
            player["f"] = bArr.readByte();
            player["g"] = bArr.readByte();
            player["i"] = bArr.readByte();
            player["k"] = bArr.readShort();
            player["m"] = bArr.readUTF();
            player["q"] = bArr.readInt();
            player["D"] = bArr.readInt();
            player["E"] = bArr.readByte();
            let bArr1 = bArr.readByte();
            player["F"] = bArr1;
            bArr.readFully(bArr1);
            player["v"] = bArr.readByte();
            player["c"] = bArr.readShort();
            player["d"] = bArr.I(0.0, 60.0);
            player["o"] = bArr.readInt();
            player["r"] = bArr.readInt();
            player["s"] = bArr.readByte();
            player["t"] = bArr.readUTF();
            player["u"] = bArr.readByte();
            let bArr2 = bArr.readByte();
            player.w = bArr2;
            if (bArr2 <= 16) {
                bArr.readFully(bArr2);
                player["x"] = bArr.readInt();
                player["y"] = bArr.readShort();
                player["z"] = bArr.readUTF();
                let bArr3 = bArr.readByte();
                player["A"] = bArr3;
                bArr.readFully(bArr3);
                player["B"] = bArr.readByte();
                player["C"] = bArr.readByte();
            }
            else {
                throw new Error("INVALID ALIAS COLORS LENGTH!");
            }
            this.player = new player_1.default(player["x"], player["t"], id);
            this.player.clan = player["z"];
            this.player.level = player["y"];
            this.bot.world.players[id] = this.player;
            this.bot.app.eventListener.onPlayerJoin(this);
        }
        for (let i = 0; i < ejectionCount; i++) {
            let ejection = {};
            let id = bArr.readByte();
            ejection["x"] = bArr.q(0.0, mapSize);
            ejection["y"] = bArr.q(0.0, mapSize);
            ejection["mass"] = bArr.q(0.0, 500000.0);
            this.bot.world.ejections[id] = ejection;
        }
        for (let i = 0; i < dotct; i++) {
            let dot = {};
            let id = staticDotStartID + i;
            dot["x"] = bArr.q(0.0, mapSize);
            dot["y"] = bArr.q(0.0, mapSize);
            this.bot.world.dots[id] = dot;
        }
        for (let i = 0; i < itemCount; i++) {
            let item = {};
            let id = staticItemStartID + i;
            item["type"] = all_1.ItemType[bArr.readByte()];
            item["x"] = bArr.q(0.0, mapSize);
            item["y"] = bArr.q(0.0, mapSize);
            this.bot.world.items[id] = item;
        }
    }
}
exports.GameData = GameData;
class TopScores extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.TOP_SCORES, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let roomName = bArr.readUTF();
        let idk1 = bArr.readInt();
        let roomTimeLeft = bArr.readShort();
        let gameMode = all_1.GameMode[bArr.readByte()];
        let roomSize = all_1.WorldSize[(bArr.readByte() & 12) >> 2];
        let maxPlayers = bArr.readByte();
        let amountPlayers = bArr.readByte();
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
exports.TopScores = TopScores;
class GameUpdate extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.GAME_UPDATE, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        bArr.readByte();
        let tick = bArr.readByte();
        let love = bArr.q(0.0, 844.1067504882812);
        let oo = bArr.D();
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
            let c = new Array(io);
            let d = new Array(io);
            let e = new Array(io);
            for (let i11 = 0; i11 < io; i11++) {
                c[i11] = bArr.readByte();
                d[i11] = bArr.q(0.0, love);
                e[i11] = bArr.q(0.0, love);
            }
        }
        if (wo > 0) {
            let l = new Array(wo);
            let m = new Array(wo);
            let n = new Array(wo);
            let o = new Array(wo);
            let q = new Array(wo);
            let p = new Array(wo);
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
                    let ej = {};
                    ej["player"] = m[i13];
                    ej["x"] = n[i13];
                    ej["y"] = o[i13];
                    ej["angle"] = q[i13];
                    ej["mass"] = p[i13];
                    for (let bot of this.bot.app.bots) {
                        bot.world.ejections[l[i13]] = ej;
                    }
                }
                else {
                    q[i13] = Number.NEGATIVE_INFINITY;
                    for (let bot of this.bot.app.bots) {
                        if (bot.world.ejections[l[i13]]) {
                            delete bot.world.ejections[l[i13]];
                        }
                    }
                }
            }
        }
        if (vo > 0) {
            let r = new Array(vo);
            let s = new Array(vo);
            let t = new Array(vo);
            for (let i15 = 0; i15 < vo; i15++) {
                r[i15] = bArr.readByte();
                s[i15] = bArr.q(0.0, love);
                t[i15] = bArr.q(0.0, love);
                for (let bot of this.bot.app.bots) {
                    if (bot.world.ejections[r[i15]]) {
                        let ej = bot.world.ejections[r[i15]];
                        ej["x"] = s[i15];
                        ej["y"] = t[i15];
                    }
                }
            }
        }
        if (lo > 0) {
            let u = new Array(lo);
            let v = new Array(lo);
            let w = new Array(lo);
            for (let i17 = 0; i17 < lo; i17++) {
                u[i17] = bArr.readShort();
                v[i17] = bArr.q(0.0, love);
                w[i17] = bArr.q(0.0, love);
                for (let bot of this.bot.app.bots) {
                    let dot = {};
                    if (bot.world.dots[u[i17]]) {
                        dot = bot.world.dots[u[i17]];
                    }
                    else {
                        dot = {};
                    }
                    dot["x"] = v[i17];
                    dot["y"] = w[i17];
                }
            }
        }
        if (so > 0) {
            let x = new Array(so);
            let y = new Array(so);
            let z = new Array(so);
            let A = new Array(so);
            for (let i19 = 0; i19 < so; i19++) {
                x[i19] = bArr.readByte();
                y[i19] = bArr.readByte();
                z[i19] = bArr.q(0.0, love);
                A[i19] = bArr.q(0.0, love);
                for (let bot of this.bot.app.bots) {
                    let item = {};
                    if (bot.world.items[x[i19]]) {
                        item = bot.world.items[x[i19]];
                    }
                    else {
                        item = {};
                        bot.world.items[x[i19]] = item;
                    }
                    item["type"] = all_1.ItemType[y[i19]];
                    item["x"] = z[i19];
                    item["y"] = A[i19];
                }
            }
        }
        if (to > 0) {
            let B = new Array(to);
            let C = new Array(to);
            let D = new Array(to);
            let E = new Array(to);
            let F = new Array(to);
            for (let i21 = 0; i21 < to; i21++) {
                let readByte5 = bArr.readByte();
                C[i21] = readByte5 & 3;
                B[i21] = (readByte5 & 252) >> 2;
                D[i21] = bArr.q(0.0, love);
                E[i21] = bArr.q(0.0, love);
                F[i21] = bArr.I(0.0, 62.6);
                let hole = {};
                hole["type"] = all_1.HoleType[C[i21]];
                hole["x"] = D[i21];
                hole["y"] = E[i21];
                hole["size"] = F[i21];
                if (F[i21] === 0) {
                    delete this.bot.world.holes[B[i21]];
                }
                else {
                    for (let bot of this.bot.app.bots) {
                        bot.world.holes[B[i21]] = hole;
                    }
                }
            }
        }
        if (jo > 0) {
            let f = new Array(jo);
            let g = new Array(jo);
            let h = new Array(jo);
            let i = new Array(jo);
            let j = new Array(jo);
            for (let i23 = 0; i23 < jo; i23++) {
                f[i23] = bArr.readByte();
                g[i23] = bArr.q(0.0, love);
                h[i23] = bArr.q(0.0, love);
                i[i23] = bArr.q(0.0, love);
                j[i23] = bArr.n(0.0, 1.0);
            }
        }
        let P = new Array();
        let Q = new Array();
        let R = new Array();
        let S = new Array();
        let T = new Array();
        if (uo > 0) {
            let K = new Array(uo);
            let L = new Array(uo);
            let M = new Array(uo);
            let N = new Array(uo);
            for (let i25 = 0; i25 < uo; i25++) {
                K[i25] = bArr.readByte();
                let readByte6 = bArr.readByte();
                L[i25] = readByte6 & 127;
                if ((readByte6 & 128) >> 7 !== 0) {
                    M[i25] = bArr.readByte();
                }
                else {
                    M[i25] = 0x00;
                }
                let readByte7 = bArr.readByte();
                N[i25] = (readByte7 & 31) | (readByte7 & 63) | (readByte7 & 95);
                let players = [];
                for (let bot of this.bot.app.bots) {
                    if (bot.world.players[K[i25]]) {
                        players.push(bot.world.players[K[i25]]);
                    }
                    else {
                        players.push(new player_1.default(K[i25], "NULL", K[i25]));
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
                    P.push((readByte8 & 252) >> 2);
                    if (z9) {
                        Q.push(bArr.readShort());
                    }
                    else {
                        Q.push(0x0000);
                    }
                    R.push(bArr.q(0.0, love));
                    S.push(bArr.q(0.0, love));
                    if (!z10) {
                        T.push(bArr.q(0.0, 500000.0));
                    }
                    else {
                        T.push(Number.NEGATIVE_INFINITY);
                    }
                    let blob = {
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
            let G = new Array(ro);
            let H = new Array(ro);
            let I = new Array(ro);
            let J = new Array(ro);
            let K = new Array(ro);
            for (let i28 = 0; i28 < ro; i28++) {
                let readByte8 = bArr.readByte();
                G[i28] = readByte8 & 127;
                H[i28] = (readByte8 & 128) >> 7 !== 0;
                I[i28] = bArr.q(0.0, love);
                J[i28] = bArr.q(0.0, love);
                K[i28] = bArr.n(0.0, Math.sqrt(2000));
            }
        }
        if (xo > 0) {
            let T = new Array(xo);
            let U = new Array(xo);
            let V = new Array(xo);
            let W = new Array(xo);
            let X = new Array(xo);
            for (let i30 = 0; i30 < xo; i30++) {
                T[i30] = bArr.readByte();
                let readByte9 = bArr.readByte();
                V[i30] = readByte9 & 3;
                U[i30] = (readByte9 & 252) >> 2;
                if (U[i30] < 0 || U[i30] >= Object.keys(all_1.SpellType).length) {
                    U[i30] = all_1.SpellType.UNKNOWN;
                }
                W[i30] = bArr.q(0.0, love);
                X[i30] = bArr.q(0.0, love);
                let spell = {};
                for (let bot of this.bot.app.bots) {
                    if (bot.world.spells[T[i30]]) {
                        spell = bot.world.spells[T[i30]];
                    }
                    else {
                        spell = {};
                        bot.world.spells[T[i30]] = spell;
                        spell["type"] = all_1.SpellType[U[i30]];
                    }
                    spell["status"] = V[i30];
                    spell["x"] = W[i30];
                    spell["y"] = X[i30];
                }
            }
        }
        if (yo > 0) {
            let Y = new Array(yo);
            let Z = new Array(yo);
            let ao = new Array(yo);
            let bo = new Array(yo);
            let co = new Array(yo);
            for (let i32 = 0; i32 < yo; i32++) {
                Y[i32] = bArr.readByte();
                Z[i32] = bArr.q(0.0, love);
                ao[i32] = bArr.q(0.0, love);
                bo[i32] = bArr.q(0.0, love);
                co[i32] = bArr.q(0.0, love);
            }
        }
        if (mo > 0) {
            let d0 = new Array(mo);
            let eo = new Array(mo);
            let fo = new Array(mo);
            for (let i34 = 0; i34 < mo; i34++) {
                d0[i34] = (bArr.readByte() + 128) & 256;
                eo[i34] = (bArr.readByte() + 128) & 256;
                fo[i34] = bArr.readByte();
            }
        }
        let r2 = ko;
        if (r2 > 0) {
            r2 = bArr.readByte();
            let event = all_1.BaseEvents[r2];
            switch (r2) {
                case all_1.BaseEvents.UNKNOWN:
                    break;
                case all_1.BaseEvents.EAT_DOTS:
                    break;
                case all_1.BaseEvents.EAT_BLOB:
                    break;
                case all_1.BaseEvents.EAT_SMBH:
                    break;
                case all_1.BaseEvents.BLOB_EXPLODE:
                    let L830_r2 = bArr.readByte();
                    let L830_r3 = bArr.readByte();
                    break;
                case all_1.BaseEvents.BLOB_LOST:
                    break;
                case all_1.BaseEvents.EJECT:
                    let L814_r2 = bArr.readByte();
                    let L814_r3 = bArr.readByte();
                    break;
                case all_1.BaseEvents.SPLIT:
                    let L806_r2 = bArr.readByte();
                    let pl = this.bot.world.players[L806_r2];
                    if (pl) {
                        pl.isSplitting = true;
                        setTimeout(() => (pl.isSplitting = false), 250);
                    }
                    break;
                case all_1.BaseEvents.RECOMBINE:
                    let L7f8_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.TIMER_WARNING:
                    break;
                case all_1.BaseEvents.CTF_SCORE:
                    break;
                case all_1.BaseEvents.CTF_FLAG_RETURNED:
                    break;
                case all_1.BaseEvents.CTF_FLAG_STOLEN:
                    break;
                case all_1.BaseEvents.ACHIEVEMENT_EARNED:
                    let L7bd_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.XP_GAINED:
                    break;
                case all_1.BaseEvents.UNUSED_2:
                    break;
                case all_1.BaseEvents.XP_SET:
                    let L79b_r11 = bArr.readLong();
                    let L79b_r13 = bArr.readByte();
                    let L79b_r14 = bArr.readInt();
                    let L79b_r15 = bArr.readByte();
                    let L79b_r16 = bArr.D();
                    break;
                case all_1.BaseEvents.DQ_SET:
                    let L788_r2 = bArr.readByte();
                    let L788_r3 = bArr.readBool();
                    break;
                case all_1.BaseEvents.DQ_COMPLETED:
                    let L779_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.DQ_PROGRESS:
                    let L76a_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.EAT_SERVER_BLOB:
                    break;
                case all_1.BaseEvents.EAT_SPECIAL_OBJECTS:
                    let L743_r2 = bArr.readByte();
                    let L743_r3 = bArr.readByte();
                    break;
                case all_1.BaseEvents.SO_SET:
                    let L730_r2 = bArr.readByte();
                    let L730_r3 = bArr.readInt();
                    break;
                case all_1.BaseEvents.LEVEL_UP:
                    let L721_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.ARENA_RANK_ACHIEVED:
                    let L70e_r2 = bArr.readByte();
                    let L70e_r3 = bArr.readByte();
                    break;
                case all_1.BaseEvents.DOM_CP_LOST:
                    break;
                case all_1.BaseEvents.DOM_CP_GAINED:
                    break;
                case all_1.BaseEvents.UNUSED_1:
                    break;
                case all_1.BaseEvents.CTF_GAINED:
                    break;
                case all_1.BaseEvents.GAME_OVER:
                    break;
                case all_1.BaseEvents.BLOB_STATUS:
                    let L6d6_r2 = bArr.readByte();
                    let L6d6_r3 = bArr.readByte();
                    let L6d6_r5 = bArr.readShort();
                    break;
                case all_1.BaseEvents.TELEPORT:
                    let L6c7_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.SHOOT:
                    let L6b0_r2 = bArr.readByte();
                    let L6b0_r3 = bArr.readByte();
                    let L6b0_r4 = bArr.readByte();
                    break;
                case all_1.BaseEvents.CLAN_WAR_WON:
                    let L6a1_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.PLASMA_REWARD:
                    let L68e_r2 = bArr.D();
                    let L68e_r5 = bArr.readByte();
                    break;
                case all_1.BaseEvents.EMOTE:
                    let L673_r2 = bArr.readByte();
                    let L673_r3 = bArr.readByte();
                    let L673_r5 = bArr.readByte();
                    let L673_r9 = bArr.readInt();
                    this.bot.emote(L673_r5);
                    break;
                case all_1.BaseEvents.END_MISSION:
                    let L653_r13 = bArr.readByte();
                    let L653_r14 = bArr.readBool();
                    let L653_r15 = bArr.readByte();
                    let L653_r16 = bArr.D();
                    let L653_r17 = bArr.readShort();
                    break;
                case all_1.BaseEvents.XP_GAINED_2:
                    let L63b_r2 = bArr.D();
                    let L63b_r5 = bArr.m1715j(60.0);
                    let L63b_r9 = bArr.D();
                    break;
                case all_1.BaseEvents.EAT_CAKE:
                    let L628_r2 = bArr.D();
                    let L628_r3 = bArr.D();
                    break;
                case all_1.BaseEvents.COIN_COUNT:
                    let L615_r2 = bArr.readByte();
                    let L615_r3 = bArr.readShort();
                    break;
                case all_1.BaseEvents.CLEAR_EFFECTS:
                    break;
                case all_1.BaseEvents.SPEED:
                    let L5fb_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.TRICK:
                    let L5e4_r2 = bArr.readByte();
                    let L5e4_r3 = bArr.readShort();
                    let L5e4_r5 = bArr.D();
                    break;
                case all_1.BaseEvents.DESTROY_ASTEROID:
                    break;
                case all_1.BaseEvents.ACCOLADE:
                    let L5c9_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.INVIS:
                    let L5ba_r2 = bArr.readShort();
                    break;
                case all_1.BaseEvents.KILLED_BY:
                    let L5ab_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.RADIATION_CLOUD:
                    let L58a_r2 = bArr.readByte();
                    let L58a_r3 = bArr.m1717b(60.0);
                    let L58a_r5 = bArr.m1717b(60.0);
                    let L58a_r9 = bArr.m1718a(0.0, 60.0);
                    break;
                case all_1.BaseEvents.CHARGE:
                    let L56a_r2 = bArr.readByte();
                    let L56a_r3 = bArr.readByte();
                    break;
                case all_1.BaseEvents.LP_COUNT:
                    let L55b_r2 = bArr.readByte();
                    break;
                case all_1.BaseEvents.BR_BOUNDS:
                    let L51f_r10 = bArr.m1717b(60.0);
                    let L51f_r11 = bArr.m1717b(60.0);
                    let L51f_r12 = bArr.m1717b(60.0);
                    let L51f_r13 = bArr.m1717b(60.0);
                    let L51f_r14 = bArr.m1717b(60.0);
                    let L51f_r15 = bArr.m1717b(60.0);
                    let L51f_r16 = bArr.m1717b(60.0);
                    let L51f_r17 = bArr.m1717b(60.0);
                    break;
                case all_1.BaseEvents.MINIMAP:
                    break;
                case all_1.BaseEvents.RLGL_DEATH:
                    break;
                case all_1.BaseEvents.RLGL_STATE:
                    let L4ed_r5 = bArr.readByte();
                    break;
                default:
                    break;
            }
        }
    }
}
exports.GameUpdate = GameUpdate;
class PacketControl extends Packet {
    constructor(bot, angle, speed, split = false, eject = false, drop = false) {
        super(bot, all_1.PacketIndex.CONTROL);
        this.angle = angle;
        this.speed = speed;
        this.split = split;
        this.eject = eject;
        this.drop = drop;
    }
    blobPatrol() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
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
        let data = new bytearray_1.default()
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
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
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
        let data = new bytearray_1.default()
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
exports.PacketControl = PacketControl;
class GroupLobbyCreateRequest extends Packet {
    constructor(bot, props) {
        super(bot, all_1.PacketIndex.GROUP_LOBBY_CREATE_REQUEST);
        this.props = props;
    }
    write() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        let data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeBool((_a = this.props.hidden) !== null && _a !== void 0 ? _a : true)
            .writeByte((_b = this.props.maxPlayers) !== null && _b !== void 0 ? _b : 8)
            .writeByte((_c = this.props.minPlayers) !== null && _c !== void 0 ? _c : 2)
            .writeByte((_d = this.props.gameMode) !== null && _d !== void 0 ? _d : all_1.GameMode.FFA_ULTRA)
            .writeByte((_e = this.props.worldSize) !== null && _e !== void 0 ? _e : all_1.WorldSize.TINY)
            .writeByte(0x02)
            .writeByte((_f = this.props.difficulty) !== null && _f !== void 0 ? _f : all_1.Difficulty.EASY)
            .writeUTF((_g = this.props.roomName) !== null && _g !== void 0 ? _g : this.bot.name)
            .writeUTF(this.bot.name)
            .writeFloat(0x417a6666)
            .writeShort(0x00a8)
            .writeShort((_h = this.props.duration) !== null && _h !== void 0 ? _h : 0x7fff)
            .writeBool((_j = this.props.mayhem) !== null && _j !== void 0 ? _j : false)
            .writeByte(0x09);
        for (let i = 0; i < 0x09; i++) {
            data.writeByte(0xff);
        }
        data.writeByte(0x17);
        let itemAmount = 0x17;
        for (let i = 0; i < itemAmount; i++) {
            data.writeBool(false);
        }
        this.data = data
            .writeByte(0x00)
            .writeByte((_k = this.props.splitMultiplier) !== null && _k !== void 0 ? _k : all_1.SplitMultiplier.X64)
            .writeBool((_l = this.props.allowUltraclick) !== null && _l !== void 0 ? _l : false)
            .writeBool((_m = this.props.allowMassBoost) !== null && _m !== void 0 ? _m : false)
            .writeByte(0x00)
            .writeInt(this.bot.connectionToken1)
            .writeBool((_o = this.props.rainbowHoles) !== null && _o !== void 0 ? _o : true)
            .writeByte((_p = this.props.walls) !== null && _p !== void 0 ? _p : 0x00)
            .writeBool((_q = this.props.admin) !== null && _q !== void 0 ? _q : false)
            .writeBool((_r = this.props.guests) !== null && _r !== void 0 ? _r : true)
            .writeBool((_s = this.props.arena) !== null && _s !== void 0 ? _s : false).data;
        return super.write();
    }
}
exports.GroupLobbyCreateRequest = GroupLobbyCreateRequest;
class BattleRoyaleAction extends Packet {
    constructor(bot) {
        super(bot, all_1.PacketIndex.BATTLE_ROYALE_ACTION);
    }
    write() {
        if (!this.bot.roomToken1 ||
            !this.bot.roomToken2 ||
            !this.bot.connectionToken1 ||
            !this.bot.connectionToken2) {
            return super.write();
        }
        this.data = new bytearray_1.default()
            .writeInt(this.bot.roomToken1)
            .writeInt(this.bot.roomToken2)
            .writeByte(0x01).data;
        return super.write();
    }
}
exports.BattleRoyaleAction = BattleRoyaleAction;
class BattleRoyaleStatusUpdate extends Packet {
    constructor(bot, data) {
        super(bot, all_1.PacketIndex.BATTLE_ROYALE_STATUS_UPDATE, data);
    }
    parse() {
        let bArr = new bytearray_1.default(this.data);
        let idk1 = bArr.readByte();
        let amountRegistrants = bArr.readByte();
        for (let bot of this.bot.app.bots) {
            bot.BRRegistrants = amountRegistrants;
        }
    }
}
exports.BattleRoyaleStatusUpdate = BattleRoyaleStatusUpdate;
exports.__PACKETS__ = {
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
