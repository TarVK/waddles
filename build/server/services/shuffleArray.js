"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src: https://stackoverflow.com/a/12646864/8521718
/**
 * Shuffles the array in place
 * @param array The array to be shuffled
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
exports.shuffleArray = shuffleArray;
//# sourceMappingURL=shuffleArray.js.map