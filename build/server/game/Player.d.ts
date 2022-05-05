import { AsyncSocketConnection } from "../AsyncSocketConnection";
import { Room } from "./Room";
import { IAttempt } from "../../_types/game/IAttempt";
export declare class Player {
    protected ID: string;
    protected socket: AsyncSocketConnection;
    protected name: string;
    protected room: Room | null;
    /** The score in the current match */
    protected score: number;
    /** The score across matches */
    protected totalScore: number;
    /** The current attempts of this player */
    protected attempts: IAttempt[];
    /**
     * Creates a new player from a socket
     * @param socket The socket to create a player for
     */
    constructor(socket: AsyncSocketConnection);
    /**
     * Listens for socket events affecting the player's properties
     */
    protected initSocketListener(): void;
    /**
     * Sets up listeners such that this player data can be retrieved by the other player
     * @param player The other player to share the data with
     */
    share(player: Player): void;
    /**
     * Removes all the listeners from the given player related to this player
     * @param player The player to remove the listeners from
     */
    unshare(player: Player): void;
    /**
     * Retrieves the socket that can be used for communication with this player
     * @returns THe socket
     */
    getSocket(): AsyncSocketConnection;
    /**
     * Retrieves the identifier of this player
     * @returns The identifier
     */
    getID(): string;
    /**
     * Retrieves the current name of this player
     * @returns The name
     */
    getName(): string;
    /**
     * Retrieves the score of this player
     * @returns The score
     */
    getScore(): number;
    /**
     * Retrieves the score of this player throughout the entire game
     * @returns The total score
     */
    getTotalScore(): number;
    /**
     * Retrieves the attempts of the player
     * @returns The player's attempts
     */
    getAttempts(): IAttempt[];
    /**
     * Retrieves the room that the player is currently in
     * @returns The room
     */
    getRoom(): Room | null;
    /**
     * Whether this player successfully guessed the word
     * @returns Whether the word was guessed
     */
    guessedWord(): boolean;
    /**
     * Sets the room the player is now in,
     * also removes the player from the previous room if he/she is still connected
     * and adds the player to the new room if he/she isn't yet added
     * @param room The room that the player was moved to
     */
    setRoom(room: Room | null): void;
    /**
     * Sets the name of this player
     * @param name The new name of the player
     */
    setName(name: string): void;
    /**
     * Sets the score of this player
     * @param score The new score
     */
    setScore(score: number): void;
    /**
     * Sets the total score of this player
     * @param totalScore The new total score
     */
    setTotalScore(totalScore: number): void;
    /**
     * Adds an attempt for this player
     * @param attempt The attempt to be added
     */
    addAttempt(attempt: IAttempt): void;
    /**
     * Sets the current attempts for this player
     * @param attempts The attempts to be set
     */
    setAttempts(attempts: IAttempt[]): void;
    /**
     * Broadcasts a message to all players in the room this player is part of
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    protected broadcast<T extends any[]>(message: string, ...args: T): void;
}
