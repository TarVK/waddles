import {IError} from "../../_types/game/IError";

/**
 * Executes the given function and returns its result or an error code if an error occurred
 * @param func The function to execute
 * @returns The result of the function, or a generic error code
 */
export const withErrorHandling = <T>(func: () => T): T | IError => {
    try {
        return func();
    } catch (e) {
        console.error(e);
        return {
            errorMessage: "An unexpected error occurred",
            errorCode: -1000,
            error: e.toString(),
        };
    }
};
