import { ConnectionState } from "../nebulous/enums/connection_state";
import dgram, { Socket } from "dgram";
import World from "../nebulous/models/world";
import {
    BattleRoyaleAction,
    ConnectRequest,
    Disconnect,
    EmoteRequest,
    EnterGameRequest,
    GameChat,
    GroupLobbyCreateRequest,
    JoinRequest,
    KeepAlive,
    Packet,
    PacketControl,
    SessionStats,
    __PACKETS__,
} from "../nebulous/packets";
import { ERROR, LOG, OK } from "./cnsl";
import { GameMode } from "../nebulous/enums/game_mode";
import { Skins } from "../nebulous/enums/skins";
import Player from "../nebulous/models/player";
import WorldProps from "../interfaces/world_props";
import App from "./app";
import { HoleType } from "../nebulous/enums/hole_types";
import { ItemType } from "../nebulous/enums/item_types";
import { exit } from "process";
import { Server } from "../nebulous/enums/servers";
import ByteArray from "./bytearray";

class Bot {
    speed: number;
    cachedSpeed: number | null;
    angle: number;
    cachedAngle: number | null;
    ejectct: number;
    splitct: number;
    tickct: number;
    dropct: number;

    name: string;
    token: string;
    connectionState: ConnectionState;
    internalID: number;
    roomToken1: number | null;
    roomToken2: number | null;
    connectionToken1: number | null;
    connectionToken2: number | null;

    isAutoRejoining: boolean;
    isRunning: boolean;
    isFarming: boolean;

    emotionalSupportPlayerName: string | null;
    emotionalSupportPlayerID: number | null;

    plasmaFarmTargetName: string | null;
    plasmaFarmTargetID: number | null;

    safeResetTimer: number;
    sock: dgram.Socket | null;
    world: World;
    joinPlayerPacket: EnterGameRequest | null;
    app: App;

    isEmoteLooping: boolean;
    emoteLoopIndex: number;

    massThreshold: number;

    execBreak: boolean;

    isMassAdvertising: boolean;
    massAdvertiseMessage: string;

    doPlasmaMeta: boolean;
    BRRegistrants: number;
    isPlasmaMetaMainScript: boolean;
    cIsPlasmaMetaFinished: boolean;

    doLvlMeta: boolean;

    constructor(name: string, token: string, internalID: number, app: App) {
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
        this.connectionState = ConnectionState.DISCONNECTED;
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
        this.world = new World();
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

    public reset(): void {
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

        // don't reset doPlasmaMeta or isPlasmaMetaMainScript since it uses desync
        this.BRRegistrants = 0;
        this.cIsPlasmaMetaFinished = true;

        this.world = new World();

        // ... keep tokens
    }

    private tick(): void {
        if (this.roomToken1 && this.roomToken2 && !this.execBreak) {
            let controlPacket = new PacketControl(this, this.angle, this.speed);

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
                            HoleType[HoleType.SUPERMASSIVE],
                            HoleType[HoleType.NEBU],
                        ]);
                    } else if (this.isFarming) {
                        if (
                            (this.plasmaFarmTargetID ||
                                this.plasmaFarmTargetName) &&
                            this.world.timeLeft < 30
                        ) {
                            let target: Player | undefined;
                            let players = { ...this.world.players };
                            for (
                                let i = 0;
                                i < Object.keys(players).length;
                                i++
                            ) {
                                target = players[i];
                                if (
                                    target["name"] ===
                                        this.plasmaFarmTargetName ||
                                    target["id"] === this.plasmaFarmTargetID
                                ) {
                                    break;
                                }
                            }
                            if (target) {
                                let pos = player.avgPos();
                                // let rad = player.radius();
                                let targetPos = target.avgPos();
                                // let targetRad = target.radius();
                                let distX = targetPos.x - pos.x;
                                let distY = targetPos.y - pos.y;
                                // let dist = Math.sqrt(distX * distX + distY * distY);
                                // let circleDist = dist - rad - targetRad;
                                let angle = Math.atan2(distY, distX);
                                this.move(angle, 1);
                            }
                        } else {
                            this.targetPlasma(player);
                        }
                        this.split();
                    } else if (
                        this.emotionalSupportPlayerID ||
                        this.emotionalSupportPlayerName
                    ) {
                        let target: Player | undefined;
                        for (let players in this.world.players) {
                            target = this.world.players[players];

                            /*
                        if (!player["name"]) {
                            continue;
                        }
                        */
                            if (
                                target["name"] ===
                                    this.emotionalSupportPlayerName ||
                                target["id"] === this.emotionalSupportPlayerID
                            ) {
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
                        } else {
                            this.move(this.angle, 0);
                            this.defendFromHoles(player);
                        }
                    } else if (this.doLvlMeta) {
                        this.targetHoles(player, false, [
                            HoleType[HoleType.NEBU],
                            HoleType[HoleType.SUPERMASSIVE],
                            HoleType[HoleType.TELEPORT],
                        ]);
                    } else {
                        this.move(this.angle, 0);
                        this.defendFromHoles(player);
                    }
                } catch (err) {
                    ERROR(
                        "NEV",
                        `Game bailed ${this.name} (NET ID ${
                            this.player() ? this.player().netID : "N/A"
                        }). Please rejoin.`
                    );
                }
            }

            this.sock?.send(controlPacket.write(), 27900, this.app.server);
            this.sock?.send(controlPacket.blobPatrol(), 27900, this.app.server);

            this.tickct = (this.tickct + 1) % 256;
        }
    }

    public setName(name: string): void {
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

    private keepAlive(): void {
        if (this.roomToken1 && this.roomToken2) {
            this.sock?.send(
                new KeepAlive(this).write(),
                27900,
                this.app.server
            );
        }
    }

    private backgroundTaskin(): void {
        if (
            this.roomToken1 &&
            this.roomToken2 &&
            !this.execBreak &&
            this.connectionState === ConnectionState.CONNECTED
        ) {
            if (
                this.isFarming &&
                !(this.world.gameMode == GameMode[GameMode.X10])
            ) {
                if (
                    this.connectionState === ConnectionState.CONNECTED &&
                    this.safeResetTimer <= 0
                ) {
                    this.enterGame(false);
                    this.safeResetTimer = 600;
                }
                this.safeResetTimer--;
            }
        }
    }

    private emoteLoop(): void {
        if (
            this.isEmoteLooping &&
            !this.execBreak &&
            this.roomToken1 &&
            this.roomToken2
        ) {
            if (this.emoteLoopIndex !== 0) {
                this.emote(this.emoteLoopIndex);
            } else {
                this.emote(Math.floor(Math.random() * 89) + 1);
            }
        }
    }

    private createTasks(): void {
        setInterval(() => this.keepAlive(), 2500);
        setInterval(() => this.backgroundTaskin(), 1000);
        setInterval(() => this.tick(), 25);
        // setInterval(() => this.massAdvertise(), 10000);
        setInterval(() => this.emoteLoop(), 100);
        // setInterval(() => this.plasmaMeta(), 100);
    }

    private plasmaMeta(): void {
        if (
            this.doPlasmaMeta &&
            this.world.gameMode == GameMode[GameMode.BATTLE_ROYALE] &&
            this.cIsPlasmaMetaFinished === true
        ) {
            this.cIsPlasmaMetaFinished = false;
            let ms = 0;
            if (this.internalID === 0 && this.isPlasmaMetaMainScript) {
                ms = 8500;
                setTimeout(() => this.desync(), ms);
                ms += 1000;
            } else {
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

    private massAdvertise(): void {
        // loop through every key inside the game mode enum and connect with it
        // the game mode passed has to be a string, so the name of the enum

        // TODO: do setTimeout instead of for loop since JS doesn't fucking wanna wait

        let gameMode: GameMode;
        let gameModes = Object.keys(GameMode);
        this.app.searchPrivate = false;
        for (let i = 0; i < gameModes.length; i++) {
            let gm: any = gameModes[i];
            gameMode = gm;
            this.app.gameMode = gameMode;

            for (let i = 0; i < 2; i++) {
                this.app.mayhem = i === 1;
                this.connect();

                while (!this.roomToken1 && !this.roomToken2) {
                    1 + 1;
                }
                //this.chat()
                console.log("lol");
                this.desync();
            }
        }
    }

    public connect(): void {
        /*
        if (!(this.connectionState ===ConnectionState.DISCONNECTED)) {
            return;
        }
        */
        if (this.sock == null) {
            this.sock = dgram.createSocket("udp4");
            this.sock.bind(0, "");
            this.sock?.on("message", (msg, rinfo) => {
                if (rinfo.port === 27900) {
                    if (this.app.debugMode) {
                        this.app.allPackets.push(new ByteArray(msg));
                    }

                    let packetID: number = msg[0];
                    let data = msg.slice(1);

                    try {
                        let packetClass: any = __PACKETS__[packetID];
                        let packet = new packetClass(this, data);
                        packet.parse();
                    } catch (err) {
                        if (err instanceof TypeError) {
                            ERROR(
                                "UNB",
                                `REF: 0x${packetID.toString(16)} (${packetID}).`
                            );
                        }
                    }
                }
            });
            this.sock?.on("error", (err) => {
                console.log(err);
            });
        }
        this.connectionToken1 = Math.floor(Math.random() * 0xffffffff);
        this.connectionToken2 = Math.floor(Math.random() * 0xffffffff);

        this.connectionState = ConnectionState.CONNECTING;
        this.sock.send(
            new ConnectRequest(
                this,
                this.app.gameMode,
                this.app.mayhem,
                this.app.searchPrivate
            ).write(),
            27900,
            this.app.server
        );
    }

    public joinGame(identifier: string | number): void {
        this.joinPlayerPacket = new EnterGameRequest(
            this,
            typeof identifier === "number" ? identifier : 0x00000000,
            typeof identifier === "string" ? identifier : ""
        );
        this.sock?.send(this.joinPlayerPacket.write(), 27900, this.app.server);
    }

    public desync(): void {
        if (this.connectionState === ConnectionState.CONNECTED) {
            this.sock?.send(
                new Disconnect(this).write(),
                27900,
                this.app.server
            );
            this.connectionState = ConnectionState.DISCONNECTED;
            this.roomToken1 = null;
            this.roomToken2 = null;
            this.connectionToken1 = Math.floor(Math.random() * 0xffffffff);
            this.connectionToken2 = Math.floor(Math.random() * 0xffffffff);
            this.reset();
        }
    }

    public enterGame(doDelay: boolean = true): void {
        let packet = new JoinRequest(this);
        if (doDelay) {
            setTimeout(() => {
                this.sock?.send(packet.write(), 27900, this.app.server);
            }, 1200);
        } else {
            this.sock?.send(packet.write(), 27900, this.app.server);
        }
    }

    public rejoin(): void {
        if (this.joinPlayerPacket != null) {
            this.sock?.send(
                this.joinPlayerPacket.write(),
                27900,
                this.app.server
            );
        }
    }

    public player(): Player {
        let players = { ...this.world.players };
        for (let i = 0; i < Object.keys(players).length; i++) {
            let player = players[i];
            if (player["name"] === this.name) {
                return player;
            }
        }
        return new Player(-1, this.name, -1);
    }

    public chat(message: string): void {
        this.sock?.send(
            new GameChat(this, message).write(),
            27900,
            this.app.server
        );
    }

    public emote(index: number): void {
        this.sock?.send(
            new EmoteRequest(this, index).write(),
            27900,
            this.app.server
        );
    }

    public move(angle: number, speed: number = 1.0): void {
        this.speed = speed;
        this.angle = angle;
    }

    public eject(count: number = 1): void {
        this.ejectct += count;
    }

    public drop(): void {
        this.dropct++;
    }

    public split(count: number = 1): void {
        this.splitct += count;
    }

    public targetPlasma(player: Player): void {
        let coins: { [tag: string]: number | string }[] = [];
        let items = { ...this.world.items };
        let pos = player.avgPos();
        for (let i = 0; i < Object.keys(items).length; i++) {
            let _coin = items[i];
            if (
                _coin["type"] == ItemType[ItemType.CAKE_PLASMA] ||
                _coin["type"] == ItemType[ItemType.CAKE_XP]
            ) {
                let coin: any = { ..._coin };
                coin["dist"] =
                    Math.pow(coin["x"] - pos["x"], 2) +
                    Math.pow(coin["y"] - pos["y"], 2);
                coins.push(coin);
            } else if (
                _coin["type"] == ItemType[ItemType.COIN] ||
                _coin["type"] == ItemType[ItemType.SUN]
            ) {
                let coin: any = { ..._coin };
                coin["dist"] =
                    Math.pow(coin["x"] - pos["x"], 2) +
                    Math.pow(coin["y"] - pos["y"], 2);
                coins.push(coin);
            }
        }
        coins.sort((a: any, b: any) => {
            return a["dist"] - b["dist"];
        });
        if (coins.length > 0) {
            let coin: any = coins[0];
            let distX: number = coin["x"] - pos["x"];
            let distY = coin["y"] - pos["y"];
            let angle = Math.atan2(distY, distX);
            this.move(angle, 1);
        }
    }

    public actionBattleRoyale(): void {
        this.sock?.send(
            new BattleRoyaleAction(this).write(),
            27900,
            this.app.server
        );
    }

    public targetHoles(
        player: Player,
        defend: boolean = false,
        holeTypes: string[] // enum members of HoleType (key)
    ): boolean {
        let holes: { [tag: string]: number | string }[] = [];
        let _holes = { ...this.world.holes };
        let pos = player.avgPos();
        for (let i = 0; i < Object.keys(_holes).length; i++) {
            let hole: any = { ..._holes[i] };
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
            holes.sort((a: any, b: any) => {
                return a["dist"] - b["dist"];
            });
            let hole: any = holes[0];
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
                    // this.eject();
                    this.ejectct = 1; // ? ability to stop instantly w/o any mass loss
                } else {
                    // proceed
                    this.move(this.cachedAngle, this.cachedSpeed as number);
                    this.cachedAngle = null;
                    this.cachedSpeed = null;
                    this.ejectct = 0;
                }
                return false;
            } else {
                this.move(angle, this.speed);
            }
            this.split();
            return true;
        } else {
            return false;
        }
    }

    public createGame(props: WorldProps): void {
        this.sock?.send(
            new GroupLobbyCreateRequest(this, props).write(),
            27900,
            this.app.server
        );
    }

    public defendFromHoles(player: Player) {
        // defend against holes if every blob bigger than ! 244
        let blobs = { ...player.blobs };
        let blobTooBigFlags = 0;
        for (let blob in blobs) {
            let b = blobs[blob];
            if (b["mass"] >= 244) {
                blobTooBigFlags++;
            }
        }
        // console.log(blobTooBigFlags, blobKeys.length);
        if (blobTooBigFlags === Object.keys(blobs).length) {
            this.targetHoles(player, true, [
                HoleType[HoleType.NEBU],
                HoleType[HoleType.NORMAL],
                HoleType[HoleType.SUPERMASSIVE],
                HoleType[HoleType.TELEPORT],
            ]);
        }
    }

    public useItem(): void {
        this.ejectct++;
    }

    public test(): void {
        this.actionBattleRoyale();
    }
}

export default Bot;
