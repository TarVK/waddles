import {AsyncSocketConnection} from "../AsyncSocketConnection";
import {uuid} from "uuidv4";
import {Room} from "./Room";
import {IPlayerData} from "../../_types/game/IPlayerData";
import {withErrorHandling} from "../services/withErrorHandling";
import {IAttempt} from "../../_types/game/IAttempt";
import {IError} from "../../_types/game/IError";

export class Player {
    protected ID: string = uuid();
    protected socket: AsyncSocketConnection;

    // The name the player chose for him/her self
    protected name: string = "Guest" + Math.floor(Math.random() * 1e3);

    // The room this player is currently in
    protected room: Room | null;

    /** The score in the current match */
    protected score = 0;
    /** The score across matches */
    protected totalScore = 0;

    /** The current attempts of this player */
    protected attempts: IAttempt[] = [];

    /**
     * Creates a new player from a socket
     * @param socket The socket to create a player for
     */
    public constructor(socket: AsyncSocketConnection) {
        this.socket = socket;
        this.initSocketListener();
    }

    // Setup
    /**
     * Listens for socket events affecting the player's properties
     */
    protected initSocketListener() {
        this.socket.on(`players/${this.ID}/setName`, (name: string) =>
            withErrorHandling(() => {
                this.setName(name);
                return {success: true};
            })
        );
        this.socket.on(`players/${this.ID}/addAttempt`, (attempt: string) =>
            withErrorHandling(() => {
                if (!this.room)
                    return {
                        success: false,
                        errorMessage: "You must be in a room to enter attempts",
                        errorCode: 5,
                    };
                const scoring = this.room.rate(attempt);
                this.addAttempt(scoring);
                this.room.checkPlayerAttempts(this);
                return {success: true, scoring: scoring};
            })
        );

        // Make sure the player can request their own data
        this.share(this);
    }

    /**
     * Sets up listeners such that this player data can be retrieved by the other player
     * @param player The other player to share the data with
     */
    public share(player: Player): void {
        player.getSocket().on(
            `players/${this.ID}/retrieve`,
            (): IPlayerData | IError =>
                withErrorHandling(() => ({
                    ID: this.ID,
                    name: this.name,
                    score: this.score,
                    totalScore: this.totalScore,
                    attempts: this.attempts,
                })),
            this.ID
        );
    }

    /**
     * Removes all the listeners from the given player related to this player
     * @param player The player to remove the listeners from
     */
    public unshare(player: Player): void {
        player.getSocket().off(`players/${this.ID}/retrieve`, this.ID);
    }

    // Getters
    /**
     * Retrieves the socket that can be used for communication with this player
     * @returns THe socket
     */
    public getSocket(): AsyncSocketConnection {
        return this.socket;
    }

    /**
     * Retrieves the identifier of this player
     * @returns The identifier
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the current name of this player
     * @returns The name
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Retrieves the score of this player
     * @returns The score
     */
    public getScore(): number {
        return this.score;
    }

    /**
     * Retrieves the score of this player throughout the entire game
     * @returns The total score
     */
    public getTotalScore(): number {
        return this.totalScore;
    }

    /**
     * Retrieves the attempts of the player
     * @returns The player's attempts
     */
    public getAttempts(): IAttempt[] {
        return this.attempts;
    }

    /**
     * Retrieves the room that the player is currently in
     * @returns The room
     */
    public getRoom(): Room | null {
        return this.room;
    }

    /**
     * Whether this player successfully guessed the word
     * @returns Whether the word was guessed
     */
    public guessedWord(): boolean {
        const lastAttempt = this.attempts[this.attempts.length - 1];
        return lastAttempt.every(l => l.type == "matches");
    }

    // Setters
    /**
     * Sets the room the player is now in,
     * also removes the player from the previous room if he/she is still connected
     * and adds the player to the new room if he/she isn't yet added
     * @param room The room that the player was moved to
     */
    public setRoom(room: Room | null): void {
        if (room == this.room) return;

        if (this.room) this.room.removePlayer(this);
        this.room = room;
        this.setScore(0);
        if (this.room) this.room.addPlayer(this);
    }

    /**
     * Sets the name of this player
     * @param name The new name of the player
     */
    public setName(name: string): void {
        this.name = name;
        this.broadcast(`players/${this.ID}/setName`, name);
    }

    /**
     * Sets the score of this player
     * @param score The new score
     */
    public setScore(score: number): void {
        this.score = score;
        this.broadcast(`players/${this.ID}/setScore`, score);
    }

    /**
     * Sets the total score of this player
     * @param totalScore The new total score
     */
    public setTotalScore(totalScore: number): void {
        this.totalScore = totalScore;
        this.broadcast(`players/${this.ID}/setTotalScore`, totalScore);
    }

    /**
     * Adds an attempt for this player
     * @param attempt The attempt to be added
     */
    public addAttempt(attempt: IAttempt): void {
        this.setAttempts([...this.attempts, attempt]);
    }

    /**
     * Sets the current attempts for this player
     * @param attempts The attempts to be set
     */
    public setAttempts(attempts: IAttempt[]): void {
        this.attempts = attempts;
        this.broadcast(`players/${this.ID}/setAttempts`, this.attempts);
    }

    // Utility
    /**
     * Broadcasts a message to all players in the room this player is part of
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    protected broadcast<T extends any[]>(message: string, ...args: T): void {
        if (this.room) this.room.broadcast(message, ...args);
    }
}
