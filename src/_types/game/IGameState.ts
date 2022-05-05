import {IGameStatus} from "./IGameStatus";

export type IGameState = {
    chooserID?: string;
    guesserID?: string;
    word?: string;
    winnerID?: string;
    round: number;
    status: IGameStatus;
};
