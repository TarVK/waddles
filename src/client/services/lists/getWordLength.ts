import {Room} from "../../model/game/Room";
import {IDataHook} from "model-react";

/**
 * Retrieves the current word length for the list used by this room
 * @param room The room to get the word length for
 * @param hook The hook to subscribe to changes
 * @returns The word length
 */
export function getWordLength(room: Room, hook: IDataHook): number {
    const wordList = room.getSettings(hook);
    const first = wordList[0];
    if (!first) return 5;
    if (first[0] == ".") return first.length - 1;
    return first.length;
}
