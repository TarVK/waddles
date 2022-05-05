"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Executes the given function and returns its result or an error code if an error occurred
 * @param func The function to execute
 * @returns The result of the function, or a generic error code
 */
exports.withErrorHandling = (func) => {
    try {
        return func();
    }
    catch (e) {
        console.error(e);
        return {
            errorMessage: "An unexpected error occurred",
            errorCode: -1000,
            error: e.toString(),
        };
    }
};
//# sourceMappingURL=withErrorHandling.js.map