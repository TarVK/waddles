import {ICharStatus} from "./ICharStatus";

/** The status for a given letter index in the word */
export type ILetterStatus = {
    type: ICharStatus;
    letter?: string;
};
