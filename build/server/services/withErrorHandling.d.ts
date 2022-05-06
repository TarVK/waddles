import { IError } from "../../_types/game/IError";
/**
 * Executes the given function and returns its result or an error code if an error occurred
 * @param func The function to execute
 * @returns The result of the function, or a generic error code
 */
export declare const withErrorHandling: <T>(func: () => T) => IError | T;
