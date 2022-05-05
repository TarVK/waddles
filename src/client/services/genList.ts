/**
 * Generates a list using the given constructor function
 * @param count The number of items to generate
 * @param generate The generate funciton
 * @returns THe generated items
 */
export function genList<T>(count: number, generate: (id: number) => T): T[] {
    return new Array(count).fill(null).map((v, i) => generate(i));
}
