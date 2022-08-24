class Player {
    netID: number;

    name: string;
    id: number;
    clan: string;
    level: number;
    skinIndex: number;
    hatIndex: number;
    haloIndex: number;
    recombineTime: number;
    blobs: { [id: number]: { [tag: string]: number } };

    isSplitting: boolean;

    constructor(id: number, name: string, netID: number) {
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

    public radius(): number {
        return Math.sqrt(this.mass());
    }

    public mass(): number {
        let blobs = { ...this.blobs };

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

    public avgPos(): { [loc: string]: number } {
        let blobs = { ...this.blobs };

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

export default Player;
