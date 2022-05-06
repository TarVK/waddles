import {SocketField} from "../socketUtils/SocketField";
import {SocketModel} from "../socketUtils/SocketModel";
import {IPlayerData} from "../../../_types/game/IPlayerData";
import {IDataHook} from "model-react";
import {ISocketResponse} from "../_types/ISocketResponse";
import {IAttempt} from "../../../_types/game/IAttempt";

export class Player extends SocketModel {
    protected ID: string;
    protected name: SocketField<string>;

    protected score: SocketField<number>;
    protected totalScore: SocketField<number>;
    protected attempts: SocketField<IAttempt[]>;

    /** The words that were entered, if that data is known to the client */
    protected attemptWords: string[];

    /**
     * Creates a new player
     * @param ID The ID of the player
     */
    protected constructor(ID: string) {
        super();
        this.ID = ID;
    }

    /**
     * Initializes this player
     */
    protected async initialize(): Promise<void> {
        const playerData = (await this.socket.emitAsync(
            `players/${this.ID}/retrieve`
        )) as IPlayerData;
        this.name = new SocketField(`players/${this.ID}/setName`, playerData.name);
        this.score = new SocketField(`players/${this.ID}/setScore`, playerData.score);
        this.totalScore = new SocketField(
            `players/${this.ID}/setTotalScore`,
            playerData.totalScore
        );
        this.attempts = new SocketField(
            `players/${this.ID}/setAttempts`,
            playerData.attempts
        );
    }

    /**
     * Creates a new player with the given ID
     * @param ID The ID of the player
     * @returns The created player
     */
    public static async create(ID: string): Promise<Player> {
        const player = new Player(ID);
        await player.initialize();
        return player;
    }

    // Getters
    /**
     * Retrieves the ID of the player
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the name of the player
     * @param hook The hook to subscribe to changes
     * @returns The name of the player
     */
    public getName(hook: IDataHook): string {
        return this.name.get(hook);
    }

    /**
     * Retrieves the score of the player
     * @param hook The hook to subscribe to changes
     * @returns The score of the player
     */
    public getScore(hook: IDataHook): number {
        return this.score.get(hook);
    }

    /**
     * Retrieves the total score of the player
     * @param hook The hook to subscribe to changes
     * @returns The score of the player
     */
    public getTotalScore(hook: IDataHook): number {
        return this.totalScore.get(hook);
    }

    /**
     * Retrieves the attempts of the player
     * @param length The length of an attempt
     * @param hook The hook to subscribe to changes
     * @returns The attempts of the player
     */
    public getAttempts(length: number, hook: IDataHook): IAttempt[] {
        return this.attempts.get(hook);
    }

    /**
     * Checks whether this player is equivalent to the passed player
     * @param player The player to compare with
     * @returns Whether these players are the same
     */
    public is(player: Player | undefined | null): boolean {
        return this.getID() == player?.getID();
    }

    // Setters
    /**
     * Sets the name of the player
     * @param name The name of the player
     * @returns The response of the server
     */
    public async setName(name: string): Promise<ISocketResponse> {
        localStorage.setItem("username", name);
        return this.name.set(name);
    }
}
