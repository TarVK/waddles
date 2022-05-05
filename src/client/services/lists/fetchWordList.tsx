/**
 * Fetches the word list by the given name
 * @param name The name of the list to retrieve
 * @returns The obtained word list
 */
export async function fetchWordList(name: string): Promise<string[]> {
    const data = await fetch(`/wordLists/${name}.json`);
    const json = data.json();
    return json;
}
