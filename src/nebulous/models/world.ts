import Player from "./player";

class World {
    name: string;
    timeLeft: number;
    gameMode: string;
    maxPlayers: number;
    amountPlayers: number;
    amountSpectators: number;
    size: string;

    players: { [id: number]: Player };
    dots: { [id: number]: { [tag: string]: number } };
    ejections: { [id: number]: { [tag: string]: number } };
    items: { [id: number]: { [tag: string]: number | string } };
    spells: {
        [id: number]: { [tag: string]: number | string };
    };
    holes: {
        [id: number]: { [tag: string]: number | string };
    };

    constructor() {
        this.name = "";

        // on restart: 65535-65532, 32767 = none
        this.timeLeft = 32767;

        this.gameMode = ""; // key of GameMode
        this.maxPlayers = 0;
        this.amountPlayers = 0;
        this.amountSpectators = 0;

        // keyof WorldSize
        this.size = "";
        this.players = {};
        this.dots = {};
        this.ejections = {};
        this.items = {};
        this.spells = {};
        this.holes = {};
    }
}

export default World;
