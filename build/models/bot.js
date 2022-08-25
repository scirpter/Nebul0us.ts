"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const connection_state_1 = require("../nebulous/enums/connection_state");
const dgram_1 = __importDefault(require("dgram"));
const world_1 = __importDefault(require("../nebulous/models/world"));
const packets_1 = require("../nebulous/packets");
const cnsl_1 = require("./cnsl");
const game_mode_1 = require("../nebulous/enums/game_mode");
const player_1 = __importDefault(require("../nebulous/models/player"));
const hole_types_1 = require("../nebulous/enums/hole_types");
const item_types_1 = require("../nebulous/enums/item_types");
const bytearray_1 = __importDefault(require("./bytearray"));
class Bot {
    constructor(name, token, internalID, app) {
        this.speed = 0;
        this.cachedSpeed = null;
        this.angle = 0;
        this.cachedAngle = null;
        this.ejectct = 0;
        this.splitct = 0;
        this.tickct = 0;
        this.dropct = 0;
        this.name = name;
        this.token = token;
        this.connectionState = connection_state_1.ConnectionState.DISCONNECTED;
        this.internalID = internalID;
        this.roomToken1 = null;
        this.roomToken2 = null;
        this.connectionToken1 = Math.floor(Math.random() * 0xffffffff);
        this.connectionToken2 = Math.floor(Math.random() * 0xffffffff);
        this.isAutoRejoining = true;
        this.isRunning = true;
        this.isFarming = false;
        this.emotionalSupportPlayerName = null;
        this.emotionalSupportPlayerID = null;
        this.plasmaFarmTargetName = null;
        this.plasmaFarmTargetID = null;
        this.safeResetTimer = 600;
        this.world = new world_1.default();
        this.sock = null;
        this.joinPlayerPacket = null;
        this.app = app;
        this.isEmoteLooping = false;
        this.emoteLoopIndex = 0;
        this.massThreshold = 250;
        this.execBreak = false;
        this.isMassAdvertising = false;
        this.massAdvertiseMessage = "";
        this.doPlasmaMeta = false;
        this.BRRegistrants = 0;
        this.isPlasmaMetaMainScript = false;
        this.cIsPlasmaMetaFinished = true;
        this.doLvlMeta = false;
        this.createTasks();
    }
    reset() {
        this.speed = 0;
        this.cachedSpeed = 0;
        this.angle = 0;
        this.cachedAngle = 0;
        this.ejectct = 0;
        this.splitct = 0;
        this.tickct = 0;
        this.isAutoRejoining = true;
        this.isFarming = false;
        this.emotionalSupportPlayerName = "";
        this.emotionalSupportPlayerID = null;
        this.plasmaFarmTargetName = "";
        this.plasmaFarmTargetID = null;
        this.isEmoteLooping = false;
        this.emoteLoopIndex = 0;
        this.massThreshold = 250;
        this.isMassAdvertising = false;
        this.BRRegistrants = 0;
        this.cIsPlasmaMetaFinished = true;
        this.world = new world_1.default();
    }
    tick() {
        var _a, _b;
        if (this.roomToken1 && this.roomToken2 && !this.execBreak) {
            let controlPacket = new packets_1.PacketControl(this, this.angle, this.speed);
            if (this.tickct % 3 === 0) {
                controlPacket.split = this.splitct > 0;
                controlPacket.split ? this.splitct-- : 0;
                controlPacket.eject = this.ejectct > 0;
                controlPacket.eject ? this.ejectct-- : 0;
                controlPacket.drop = this.dropct > 0;
                controlPacket.drop ? this.dropct-- : 0;
                try {
                    let player = this.player();
                    if (!this.isFarming && player.mass() < this.massThreshold) {
                        this.move(this.angle, 1);
                        this.targetHoles(player, false, [
                            hole_types_1.HoleType[hole_types_1.HoleType.SUPERMASSIVE],
                            hole_types_1.HoleType[hole_types_1.HoleType.NEBU],
                        ]);
                    }
                    else if (this.isFarming) {
                        if ((this.plasmaFarmTargetID ||
                            this.plasmaFarmTargetName) &&
                            this.world.timeLeft < 30) {
                            let target;
                            let players = Object.assign({}, this.world.players);
                            for (let i = 0; i < Object.keys(players).length; i++) {
                                target = players[i];
                                if (target["name"] ===
                                    this.plasmaFarmTargetName ||
                                    target["id"] === this.plasmaFarmTargetID) {
                                    break;
                                }
                            }
                            if (target) {
                                let pos = player.avgPos();
                                let targetPos = target.avgPos();
                                let distX = targetPos.x - pos.x;
                                let distY = targetPos.y - pos.y;
                                let angle = Math.atan2(distY, distX);
                                this.move(angle, 1);
                            }
                        }
                        else {
                            this.targetPlasma(player);
                        }
                        this.split();
                    }
                    else if (this.emotionalSupportPlayerID ||
                        this.emotionalSupportPlayerName) {
                        let target;
                        for (let players in this.world.players) {
                            target = this.world.players[players];
                            if (target["name"] ===
                                this.emotionalSupportPlayerName ||
                                target["id"] === this.emotionalSupportPlayerID) {
                                break;
                            }
                        }
                        if (target) {
                            let pos = player.avgPos();
                            let rad = player.radius();
                            let targetPos = target.avgPos();
                            let targetRad = target.radius();
                            let distX = targetPos.x - pos.x;
                            let distY = targetPos.y - pos.y;
                            let dist = Math.sqrt(distX * distX + distY * distY);
                            let circleDist = dist - rad - targetRad;
                            let angle = Math.atan2(distY, distX);
                            this.move(angle, 1);
                            this.split();
                        }
                        else {
                            this.move(this.angle, 0);
                            this.defendFromHoles(player);
                        }
                    }
                    else if (this.doLvlMeta) {
                        this.targetHoles(player, false, [
                            hole_types_1.HoleType[hole_types_1.HoleType.NEBU],
                            hole_types_1.HoleType[hole_types_1.HoleType.SUPERMASSIVE],
                            hole_types_1.HoleType[hole_types_1.HoleType.TELEPORT],
                        ]);
                    }
                    else {
                        this.move(this.angle, 0);
                        this.defendFromHoles(player);
                    }
                }
                catch (err) {
                    (0, cnsl_1.ERROR)("NEV", `Game bailed ${this.name} (NET ID ${this.player() ? this.player().netID : "N/A"}). Please rejoin.`);
                }
            }
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(controlPacket.write(), 27900, this.app.server);
            (_b = this.sock) === null || _b === void 0 ? void 0 : _b.send(controlPacket.blobPatrol(), 27900, this.app.server);
            this.tickct = (this.tickct + 1) % 256;
        }
    }
    setName(name) {
        for (let bot of this.app.bots) {
            for (let player in bot.world.players) {
                let pl = bot.world.players[player];
                if (pl["name"] === this.name) {
                    pl["name"] = name;
                }
            }
        }
        this.name = name;
    }
    keepAlive() {
        var _a;
        if (this.roomToken1 && this.roomToken2) {
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.KeepAlive(this).write(), 27900, this.app.server);
        }
    }
    backgroundTaskin() {
        if (this.roomToken1 &&
            this.roomToken2 &&
            !this.execBreak &&
            this.connectionState === connection_state_1.ConnectionState.CONNECTED) {
            if (this.isFarming &&
                !(this.world.gameMode == game_mode_1.GameMode[game_mode_1.GameMode.X10])) {
                if (this.connectionState === connection_state_1.ConnectionState.CONNECTED &&
                    this.safeResetTimer <= 0) {
                    this.enterGame(false);
                    this.safeResetTimer = 600;
                }
                this.safeResetTimer--;
            }
        }
    }
    emoteLoop() {
        if (this.isEmoteLooping &&
            !this.execBreak &&
            this.roomToken1 &&
            this.roomToken2) {
            if (this.emoteLoopIndex !== 0) {
                this.emote(this.emoteLoopIndex);
            }
            else {
                this.emote(Math.floor(Math.random() * 89) + 1);
            }
        }
    }
    createTasks() {
        setInterval(() => this.keepAlive(), 2500);
        setInterval(() => this.backgroundTaskin(), 1000);
        setInterval(() => this.tick(), 25);
        setInterval(() => this.emoteLoop(), 100);
    }
    plasmaMeta() {
        if (this.doPlasmaMeta &&
            this.world.gameMode == game_mode_1.GameMode[game_mode_1.GameMode.BATTLE_ROYALE] &&
            this.cIsPlasmaMetaFinished === true) {
            this.cIsPlasmaMetaFinished = false;
            let ms = 0;
            if (this.internalID === 0 && this.isPlasmaMetaMainScript) {
                ms = 8500;
                setTimeout(() => this.desync(), ms);
                ms += 1000;
            }
            else {
                ms = 7500;
                setTimeout(() => this.desync(), ms);
                ms += 2000;
            }
            if (this.internalID === 0) {
                for (let i = 0; i < this.app.bots.length; i++) {
                    let bot = this.app.bots[i];
                    setTimeout(() => {
                        bot.connect();
                    }, ms + 1800 * i);
                    setTimeout(() => bot.actionBattleRoyale(), ms + 3000 * i);
                }
            }
            setTimeout(() => (this.cIsPlasmaMetaFinished = true), ms + 1800);
        }
    }
    massAdvertise() {
        let gameMode;
        let gameModes = Object.keys(game_mode_1.GameMode);
        this.app.searchPrivate = false;
        for (let i = 0; i < gameModes.length; i++) {
            let gm = gameModes[i];
            gameMode = gm;
            this.app.gameMode = gameMode;
            for (let i = 0; i < 2; i++) {
                this.app.mayhem = i === 1;
                this.connect();
                while (!this.roomToken1 && !this.roomToken2) {
                    1 + 1;
                }
                console.log("lol");
                this.desync();
            }
        }
    }
    connect() {
        var _a, _b;
        if (this.sock == null) {
            this.sock = dgram_1.default.createSocket("udp4");
            this.sock.bind(0, "");
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.on("message", (msg, rinfo) => {
                if (rinfo.port === 27900) {
                    if (this.app.debugMode) {
                        this.app.allPackets.push(new bytearray_1.default(msg));
                    }
                    let packetID = msg[0];
                    let data = msg.slice(1);
                    try {
                        let packetClass = packets_1.__PACKETS__[packetID];
                        let packet = new packetClass(this, data);
                        packet.parse();
                    }
                    catch (err) {
                        if (err instanceof TypeError) {
                            (0, cnsl_1.ERROR)("UNB", `REF: 0x${packetID.toString(16)} (${packetID}).`);
                        }
                    }
                }
            });
            (_b = this.sock) === null || _b === void 0 ? void 0 : _b.on("error", (err) => {
                console.log(err);
            });
        }
        this.connectionToken1 = Math.floor(Math.random() * 0xffffffff);
        this.connectionToken2 = Math.floor(Math.random() * 0xffffffff);
        this.connectionState = connection_state_1.ConnectionState.CONNECTING;
        this.sock.send(new packets_1.ConnectRequest(this, this.app.gameMode, this.app.mayhem, this.app.searchPrivate).write(), 27900, this.app.server);
    }
    joinGame(identifier) {
        var _a;
        this.joinPlayerPacket = new packets_1.EnterGameRequest(this, typeof identifier === "number" ? identifier : 0x00000000, typeof identifier === "string" ? identifier : "");
        (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(this.joinPlayerPacket.write(), 27900, this.app.server);
    }
    desync() {
        var _a;
        if (this.connectionState === connection_state_1.ConnectionState.CONNECTED) {
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.Disconnect(this).write(), 27900, this.app.server);
            this.connectionState = connection_state_1.ConnectionState.DISCONNECTED;
            this.roomToken1 = null;
            this.roomToken2 = null;
            this.connectionToken1 = Math.floor(Math.random() * 0xffffffff);
            this.connectionToken2 = Math.floor(Math.random() * 0xffffffff);
            this.reset();
        }
    }
    enterGame(doDelay = true) {
        var _a;
        let packet = new packets_1.JoinRequest(this);
        if (doDelay) {
            setTimeout(() => {
                var _a;
                (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(packet.write(), 27900, this.app.server);
            }, 1200);
        }
        else {
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(packet.write(), 27900, this.app.server);
        }
    }
    rejoin() {
        var _a;
        if (this.joinPlayerPacket != null) {
            (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(this.joinPlayerPacket.write(), 27900, this.app.server);
        }
    }
    player() {
        let players = Object.assign({}, this.world.players);
        for (let i = 0; i < Object.keys(players).length; i++) {
            let player = players[i];
            if (player["name"] === this.name) {
                return player;
            }
        }
        return new player_1.default(-1, this.name, -1);
    }
    chat(message) {
        var _a;
        (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.GameChat(this, message).write(), 27900, this.app.server);
    }
    emote(index) {
        var _a;
        (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.EmoteRequest(this, index).write(), 27900, this.app.server);
    }
    move(angle, speed = 1.0) {
        this.speed = speed;
        this.angle = angle;
    }
    eject(count = 1) {
        this.ejectct += count;
    }
    drop() {
        this.dropct++;
    }
    split(count = 1) {
        this.splitct += count;
    }
    targetPlasma(player) {
        let coins = [];
        let items = Object.assign({}, this.world.items);
        let pos = player.avgPos();
        for (let i = 0; i < Object.keys(items).length; i++) {
            let _coin = items[i];
            if (_coin["type"] == item_types_1.ItemType[item_types_1.ItemType.CAKE_PLASMA] ||
                _coin["type"] == item_types_1.ItemType[item_types_1.ItemType.CAKE_XP]) {
                let coin = Object.assign({}, _coin);
                coin["dist"] =
                    Math.pow(coin["x"] - pos["x"], 2) +
                        Math.pow(coin["y"] - pos["y"], 2);
                coins.push(coin);
            }
            else if (_coin["type"] == item_types_1.ItemType[item_types_1.ItemType.COIN] ||
                _coin["type"] == item_types_1.ItemType[item_types_1.ItemType.SUN]) {
                let coin = Object.assign({}, _coin);
                coin["dist"] =
                    Math.pow(coin["x"] - pos["x"], 2) +
                        Math.pow(coin["y"] - pos["y"], 2);
                coins.push(coin);
            }
        }
        coins.sort((a, b) => {
            return a["dist"] - b["dist"];
        });
        if (coins.length > 0) {
            let coin = coins[0];
            let distX = coin["x"] - pos["x"];
            let distY = coin["y"] - pos["y"];
            let angle = Math.atan2(distY, distX);
            this.move(angle, 1);
        }
    }
    actionBattleRoyale() {
        var _a;
        (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.BattleRoyaleAction(this).write(), 27900, this.app.server);
    }
    targetHoles(player, defend = false, holeTypes) {
        let holes = [];
        let _holes = Object.assign({}, this.world.holes);
        let pos = player.avgPos();
        for (let i = 0; i < Object.keys(_holes).length; i++) {
            let hole = Object.assign({}, _holes[i]);
            if (!hole) {
                continue;
            }
            if (holeTypes.includes(hole["type"])) {
                hole["dist"] =
                    Math.pow(hole["x"] - pos["x"], 2) +
                        Math.pow(hole["y"] - pos["y"], 2);
                holes.push(hole);
            }
        }
        if (holes.length > 0) {
            holes.sort((a, b) => {
                return a["dist"] - b["dist"];
            });
            let hole = holes[0];
            let distX = hole["x"] - pos["x"];
            let distY = hole["y"] - pos["y"];
            let angle = Math.atan2(distY, distX);
            if (defend) {
                let dist = Math.sqrt(distX * distX + distY * distY);
                let rad = player.radius();
                let targetRad = Math.sqrt(244);
                let circleDist = dist - rad - targetRad;
                if (!this.cachedAngle) {
                    this.cachedAngle = this.angle;
                    this.cachedSpeed = this.speed;
                }
                if (circleDist < 20) {
                    this.move(angle, 0);
                    this.ejectct = 1;
                }
                else {
                    this.move(this.cachedAngle, this.cachedSpeed);
                    this.cachedAngle = null;
                    this.cachedSpeed = null;
                    this.ejectct = 0;
                }
                return false;
            }
            else {
                this.move(angle, this.speed);
            }
            this.split();
            return true;
        }
        else {
            return false;
        }
    }
    createGame(props) {
        var _a;
        (_a = this.sock) === null || _a === void 0 ? void 0 : _a.send(new packets_1.GroupLobbyCreateRequest(this, props).write(), 27900, this.app.server);
    }
    defendFromHoles(player) {
        let blobs = Object.assign({}, player.blobs);
        let blobTooBigFlags = 0;
        for (let blob in blobs) {
            let b = blobs[blob];
            if (b["mass"] >= 244) {
                blobTooBigFlags++;
            }
        }
        if (blobTooBigFlags === Object.keys(blobs).length) {
            this.targetHoles(player, true, [
                hole_types_1.HoleType[hole_types_1.HoleType.NEBU],
                hole_types_1.HoleType[hole_types_1.HoleType.NORMAL],
                hole_types_1.HoleType[hole_types_1.HoleType.SUPERMASSIVE],
                hole_types_1.HoleType[hole_types_1.HoleType.TELEPORT],
            ]);
        }
    }
    useItem() {
        this.ejectct++;
    }
    test() {
        this.actionBattleRoyale();
    }
}
exports.default = Bot;
