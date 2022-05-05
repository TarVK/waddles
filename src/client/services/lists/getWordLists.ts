import {IWordListSource} from "./_types/IWordListSource";
import {fetchWordList} from "./fetchWordList";

export function getWordLists(): IWordListSource[] {
    const defaultLists: IWordListSource[] = [
        {
            name: "english-5",
            description: "English 5 letter words",
            isCustom: false,
            get: () => fetchWordList("english-5"),
        },
    ];

    // Add all the custom lists
    let customLists: IWordListSource[] = [];
    try {
        const listsRaw = localStorage.getItem("customWordLists");
        const lists = JSON.parse(listsRaw ?? "");
        if (lists instanceof Array) {
            for (let {name, description, list} of lists) {
                if (
                    list instanceof Array &&
                    typeof name == "string" &&
                    typeof description == "string"
                ) {
                    const areAllWords = list.every(
                        word => typeof word == "string" && word.length == list[0].length
                    );
                    if (areAllWords)
                        customLists.push({
                            name,
                            description,
                            isCustom: true,
                            get: () => Promise.resolve(list),
                        });
                }
            }
        }
    } catch (e) {}

    return [...customLists, ...defaultLists];
}
