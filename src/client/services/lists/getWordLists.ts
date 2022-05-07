import {IWordListSource} from "./_types/IWordListSource";
import {fetchWordList} from "./fetchWordList";

export function getWordLists(): IWordListSource[] {
    const defaultLists: IWordListSource[] = [
        {
            name: "English-5 wordle",
            description: "English 5 letter words used by wordle",
            isCustom: false,
            get: () => fetchWordList("5-letter-english-wordle"),
        },
        {
            name: "English-5",
            description: "English 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-english"),
        },
        {
            name: "English-6",
            description: "English 6 letter words",
            isCustom: false,
            get: () => fetchWordList("6-letter-english"),
        },
        {
            name: "English-7",
            description: "English 7 letter words",
            isCustom: false,
            get: () => fetchWordList("7-letter-english"),
        },
        {
            name: "English-5 names",
            description: "English 5 letter names",
            isCustom: false,
            get: () => fetchWordList("5-letter-english-names"),
        },
        {
            name: "English-5 with names",
            description: "English 5 letter words and names",
            isCustom: false,
            get: () => fetchWordList("5-letter-english-with-names"),
        },
        {
            name: "Dutch-5",
            description: "Dutch 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-dutch"),
        },
        {
            name: "Brazilian-5",
            description: "Brazilian 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-brazilian"),
        },
        {
            name: "German-5",
            description: "German 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-german"),
        },
        {
            name: "Italian-5",
            description: "Italian 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-italian"),
        },
        {
            name: "Spanish-5",
            description: "Spanish 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-spanish"),
        },
        {
            name: "Swedish-5",
            description: "Swedish 5 letter words",
            isCustom: false,
            get: () => fetchWordList("5-letter-swedish"),
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
                    const wordLength = list[0].length - (list[0][0] == "." ? 1 : 0);
                    const areAllWords = list.every(
                        word =>
                            typeof word == "string" &&
                            word.length - (word[0] == "." ? 1 : 0) == wordLength
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
