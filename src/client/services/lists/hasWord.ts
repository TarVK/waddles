/**
 * Checks whether the word list contains the given word
 * @param list The list to be checked
 * @param word The word to be checked
 * @returns Whether the list contains the word
 */
export function hasWord(list: string[], word: string): boolean {
    if (word[0] == ".") return false;
    if (list.includes(word)) return true;
    if (list.includes("." + word)) return true;
    return false;
}
