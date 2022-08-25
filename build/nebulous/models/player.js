"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(id, name, netID) {
        this.netID = netID;
        this.id = id;
        this.name = name;
        this.clan = "";
        this.level = -1;
        this.skinIndex = 0;
        this.hatIndex = 0;
        this.haloIndex = 0;
        this.recombineTime = 0;
        this.blobs = {};
        this.isSplitting = false;
    }
    radius() {
        return Math.sqrt(this.mass());
    }
    mass() {
        let blobs = Object.assign({}, this.blobs);
        if (Object.keys(blobs).length === 0) {
            return 0;
        }
        let total = 0;
        for (let blob in blobs) {
            let b = blobs[blob];
            if (b["mass"] > 0) {
                total += b["mass"];
            }
        }
        return total;
    }
    avgPos() {
        let blobs = Object.assign({}, this.blobs);
        if (Object.keys(blobs).length === 0) {
            return { x: 0, y: 0 };
        }
        let avgX = 0;
        let avgY = 0;
        for (let blob in blobs) {
            let b = blobs[blob];
            avgX += b.x;
            avgY += b.y;
        }
        return {
            x: avgX / Object.keys(blobs).length,
            y: avgY / Object.keys(blobs).length,
        };
    }
}
exports.default = Player;
