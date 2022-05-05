import {IAttempt} from "./IAttempt";

export type IPlayerData = {
    ID: string;
    name: string;
    score: number;
    totalScore: number;
    attempts: IAttempt[];
};
