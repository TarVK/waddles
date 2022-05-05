import { IGameStatus } from "./IGameStatus";
export declare type IGameState = {
    chooserID?: string;
    guesserID?: string;
    word?: string;
    winnerID?: string;
    round: number;
    status: IGameStatus;
};
