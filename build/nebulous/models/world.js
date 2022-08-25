"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class World {
    constructor() {
        this.name = "";
        this.timeLeft = 32767;
        this.gameMode = "";
        this.maxPlayers = 0;
        this.amountPlayers = 0;
        this.amountSpectators = 0;
        this.size = "";
        this.players = {};
        this.dots = {};
        this.ejections = {};
        this.items = {};
        this.spells = {};
        this.holes = {};
    }
}
exports.default = World;
