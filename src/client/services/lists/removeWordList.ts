import {Field} from "model-react";
import {getWordLists} from "./getWordLists";
import {wordListVersion} from "./addWordLists";

export async function removeWordList(name: string) {
    const lists = getWordLists();

    const customLists = lists.filter(({isCustom}) => isCustom);
    const customListsInputs = await Promise.all(
        customLists.map(async ({name, description, get}) => ({
            name,
            description,
            list: await get(),
        }))
    );

    const newCustomLists = customListsInputs.filter(list => list.name != name);

    const text = JSON.stringify(newCustomLists);
    localStorage.setItem("customWordLists", text);

    wordListVersion.set(wordListVersion.get(null) + 1);
}
