import {IScoreMode} from "./IScoreMode";
import {IWordMode} from "./IWordMode";

export type IGameSettings = {
    /** The scoring mode that's used */
    scoring: IScoreMode;
    /** The number of attempts that each player has */
    attempts: number;
    /** How the word is determined */
    wordMode: IWordMode;
    /** All the words that are recognized as valid words */
    wordList: string[];
    /** The name for the currently selected word set */
    wordListName: string;
    /** How many rounds are used in the game before the winner is chosen */
    rounds: number;
    /** Whether you can see your opponent's guesses */
    seeOpponents: boolean;
};
