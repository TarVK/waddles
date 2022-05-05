import {IGameSettings} from "./IGameSettings";
import {IGameState} from "./IGameState";

export type IRoomData = {
    ID: string;
    accessibility: {privat: boolean; maxPlayerCount: number};
    playerIDs: string[];
    settings: IGameSettings;
    state: IGameState;
};
