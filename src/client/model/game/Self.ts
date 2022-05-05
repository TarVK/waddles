import {Player} from "./Player";
import {ISocketResponse} from "../_types/ISocketResponse";
import {Field, IDataHook} from "model-react";
import {Observer} from "../../services/Observer";
import {IAttempt} from "../../../_types/game/IAttempt";
import {genList} from "../../services/genList";
import {ILetterStatus} from "../../../_types/game/ILetterStatus";

export class Self extends Player {
    protected guesses = new Field<string[]>([]);
    protected newGuess = new Field<string>("");

    /**
     * Creates a new player
     * @param ID The ID of the player
     */
    protected constructor(ID: string) {
        super(ID);
    }

    /**
     * Initializes this player
     */
    protected async initialize(): Promise<void> {
        await super.initialize();

        // Make guesses reset when the attempts reset
        new Observer(h => this.attempts.get(h)).listen((attempts, _, prev) => {
            const reset = attempts.length < (prev?.length || 0);
            if (reset) {
                this.guesses.set([]);
                this.newGuess.set("");
            }
        });
    }

    /**
     * Creates a new player with the given ID
     * @param ID The ID of the player
     * @returns The created player
     */
    public static async create(ID: string): Promise<Self> {
        const player = new Self(ID);
        await player.initialize();
        return player;
    }

    // Getters
    /**
     * Retrieves the currently entered guess
     * @param hook The hook to subscribe to changes
     * @returns The currently entered guess
     */
    public getGuess(hook: IDataHook): string {
        return this.newGuess.get(hook);
    }

    /**
     * Retrieves the attempts of the player
     * @param length The length of an attempt
     * @param hook The hook to subscribe to changes
     * @returns The attempts of the player
     */
    public getAttempts(length: number, hook: IDataHook): IAttempt[] {
        const attempts = this.attempts.get(hook);
        const lastGuess = this.newGuess.get(hook);
        const prevGuesses = this.guesses.get(hook);
        const guesses = lastGuess.length > 0 ? [...prevGuesses, lastGuess] : prevGuesses;

        return guesses.map((guess, i) => {
            const attempt = attempts[i];
            return genList<ILetterStatus>(length, j => ({
                letter: guess[j] ?? undefined,
                type: attempt?.[j]?.type ?? "unknown",
            }));
        });
    }

    // Actions
    /**
     * Sets the new guess that's being entered
     * @param guess The guess that's being entered
     */
    public setGuess(guess: string): void {
        this.newGuess.set(guess);
    }

    /**
     * Guesses the last entered word
     * @returns The submission response
     */
    public async guess(): Promise<ISocketResponse> {
        const guess = this.newGuess.get(null);
        this.guesses.set([...this.guesses.get(null), guess]);
        this.newGuess.set("");
        return this.socket.emitAsync(`players/${this.ID}/addAttempt`, guess);
    }
}
