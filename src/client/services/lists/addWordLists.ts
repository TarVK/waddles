import {Field} from "model-react";
import {getWordLists} from "./getWordLists";
import {IWordListSource} from "./_types/IWordListSource";

export const wordListVersion = new Field(0);

export async function addWordList(name: string, description: string, list: string[]) {
    const lists = getWordLists();

    const customLists = lists.filter(({isCustom}) => isCustom);
    const customListsInputs = await Promise.all(
        customLists.map(async ({name, description, get}) => ({
            name,
            description,
            list: await get(),
        }))
    );

    const newCustomLists = [
        ...customListsInputs,
        {
            name,
            description,
            list,
        },
    ];

    const text = JSON.stringify(newCustomLists);
    localStorage.setItem("customWordLists", text);

    wordListVersion.set(wordListVersion.get(null) + 1);
}
