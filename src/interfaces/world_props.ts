import {
    Difficulty,
    GameMode,
    SplitMultiplier,
    WorldSize,
} from "../nebulous/enums/all";

interface WorldProps {
    hidden: boolean | null;
    maxPlayers: number | null;
    minPlayers: number | null;
    gameMode: GameMode | null;
    worldSize: WorldSize | null;
    difficulty: Difficulty | null;
    roomName: string | null;
    duration: number | null;
    mayhem: boolean | null;
    splitMultiplier: SplitMultiplier | null;
    allowUltraclick: boolean | null;
    allowMassBoost: boolean | null;
    rainbowHoles: boolean | null;
    walls: number | null;
    admin: boolean | null;
    guests: boolean | null;
    arena: boolean | null;
}

export default WorldProps;
