import {Field, IDataHook} from "model-react";
import {Player} from "./Player";
import {IRoomData} from "../../../_types/game/IRoomData";
import {IError} from "../../../_types/game/IError";
import {SocketModel} from "../socketUtils/SocketModel";
import {ISocketResponse} from "../_types/ISocketResponse";
import {SocketField} from "../socketUtils/SocketField";
import {IGameSettings} from "../../../_types/game/IGameSettings";
import {IGameState} from "../../../_types/game/IGameState";
import {IGameStatus} from "../../../_types/game/IGameStatus";

export class Room extends SocketModel {
    protected ID: string;

    protected accessibility: SocketField<{privat: boolean; maxPlayerCount: number}>;
    protected settings: SocketField<IGameSettings>;

    protected players = new Field([] as Player[]);

    protected state: SocketField<IGameState>;

    /**
     * Creates a new room with the given ID
     * @param ID The ID of the room
     */
    protected constructor(ID: string) {
        super();
        this.ID = ID;
    }

    /**
     * Initializes this room
     */
    protected async initialize(): Promise<void> {
        const roomData = (await this.socket.emitAsync(`rooms/${this.ID}/retrieve`)) as
            | IRoomData
            | IError;
        if ("errorMessage" in roomData) {
            console.error(roomData);
            throw roomData.errorMessage;
        }

        const players = await Promise.all(
            roomData.playerIDs.map(ID => Player.create(ID))
        );
        this.players.set([...players, ...this.players.get(null)]);
        this.settings = new SocketField(
            `rooms/${this.ID}/setSettings`,
            roomData.settings
        );
        this.accessibility = new SocketField(
            `rooms/${this.ID}/setAccessibility`,
            roomData.accessibility
        );

        this.state = new SocketField(`rooms/${this.ID}/setState`, roomData.state);
    }

    /**
     * Sets up all the event listeners
     */
    protected setupListeners(): void {
        this.socket.on(`rooms/${this.ID}/addPlayer`, async (ID: string) => {
            const newPlayer = await Player.create(ID);
            this.players.set([...this.players.get(null), newPlayer]);
        });
        this.socket.on(`rooms/${this.ID}/removePlayer`, (ID: string) => {
            this.players.set(this.players.get(null).filter(p => p.getID() != ID));
        });
        this.socket.on(`rooms/${this.ID}/kickPlayer`, (ID: string) => {
            const player = this.players.get(null).find(p => p.getID() == ID);
            this.eventManager.emit("kick", player);
        });
    }

    /**
     * Creates a new instance of a room and joins it
     * @param ID The ID of the room to join
     * @returns The room that was joined
     */
    public static async joinRoom(ID: string): Promise<Room> {
        const room = new Room(ID);
        room.setupListeners();
        await room.initialize();
        return room;
    }

    // Getters
    /**
     * Retrieves the ID of this room
     * @returns The ID
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves the players currently in the room
     * @param hook The data hook to subscribe to changes
     * @returns The players
     */
    public getPlayers(hook: IDataHook): Player[] {
        return this.players.get(hook);
    }

    /**
     * Retrieves the other players in the room
     * @param me The player this client represents
     * @param hook The data hook to subscribe to changes
     * @return The players
     */
    public getOtherPlayers(me: Player, hook: IDataHook): Player[] {
        return this.players.get(hook).filter(p => p != me);
    }

    /**
     * Retrieves the player that is currently choosing the word
     * @param hook The data hook to subscribe to changes
     * @returns The chooser
     */
    public getChooser(hook: IDataHook): Player | null {
        const chooserID = this.state.get(hook).chooserID;
        return this.players.get(hook).find(player => player.getID() == chooserID) ?? null;
    }

    /**
     * Retrieves the player that is currently performing a guess
     * @param hook The data hook to subscribe to changes
     * @returns The guesser
     */
    public getGuesser(hook: IDataHook): Player | null {
        const guesserID = this.state.get(hook).guesserID;
        return this.players.get(hook).find(player => player.getID() == guesserID) ?? null;
    }

    /**
     * Retrieves the player that just won the round
     * @param hook The data hook to subscribe to changes
     * @returns The winner
     */
    public getWinner(hook: IDataHook): Player | null {
        const winnerID = this.state.get(hook).winnerID;
        return this.players.get(hook).find(player => player.getID() == winnerID) ?? null;
    }

    /**
     * Retrieves the admin of the room
     * @param hook The data hook to subscribe to changes
     * @returns The admin
     */
    public getAdmin(hook: IDataHook): Player {
        return this.players.get(hook)[0];
    }

    /**
     * Retrieves the current game status
     * @param hook The data hook to subscribe to changes
     * @returns The status
     */
    public getStatus(hook: IDataHook): IGameStatus {
        return this.state.get(hook).status;
    }

    /**
     * The round that we're currently in
     * @param hook The data hook to subscribe to changes
     * @returns The current round
     */
    public getRound(hook: IDataHook): number {
        return this.state.get(hook).round;
    }

    /**
     * Retrieves whether this room is private
     * @param hook The hook to track changes
     * @returns Whether private
     */
    public isPrivate(hook: IDataHook): boolean {
        return this.accessibility.get(hook).privat;
    }

    /**
     * Retrieves the maximum number of players for this room
     * @param hook The hook to track changes
     * @returns The max number of players
     */
    public getMaxPlayerCount(hook: IDataHook): number {
        return this.accessibility.get(hook).maxPlayerCount;
    }

    /**
     * Retrieves the settings of the game
     * @param hook The hook to track changes
     * @returns The settings
     */
    public getSettings(hook: IDataHook): IGameSettings {
        return this.settings.get(hook);
    }

    // Actions
    /**
     * Kicks the specified player, only available if this client is admin
     * @param player The player to be kicked
     * @returns The server response
     */
    public async kick(player: Player): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/kickPlayer`, player.getID());
    }

    /**
     * Starts the game
     * @returns The server's response
     */
    public async start(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/start`);
    }

    /**
     * Starts the next round
     * @returns The server's response
     */
    public async nextRound(): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/nextRound`);
    }

    /**
     * Sets the word to be guessed by opponents
     * @returns The words to be chosen
     */
    public async setWord(word: string): Promise<ISocketResponse> {
        return this.socket.emitAsync(`rooms/${this.ID}/enterWord`, word);
    }

    /**
     * Sets the maximum number of players allowed in this room
     * @param count The maximum number of allowed players
     */
    public setMaxPlayerCount(count: number): void {
        this.accessibility.set({...this.accessibility.get(null), maxPlayerCount: count});
    }

    /**
     * Sets whether this room is private
     * @param private Whether private
     */
    public setPrivate(privat: boolean): void {
        this.accessibility.set({...this.accessibility.get(null), privat});
    }

    /**
     * Sets the game settings
     * @param settings The settings to be used by the game
     */
    public setSettings(settings: IGameSettings): void {
        this.settings.set(settings);
    }

    // Event handlers
    /**
     * Adds an event listener to detect when a player is kicked
     * @param eventType The kick event type
     * @param listener The listener to register
     * @param label A label for the listener
     */
    public on(
        eventType: "kick",
        listener: (player: Player) => void,
        label?: string
    ): void;
    public on(
        eventType: string,
        listener: (...args: any[]) => void,
        label?: string
    ): void {
        this.eventManager.on(eventType, listener, label);
    }

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    public off(eventType: "kick", label: string): boolean;

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    public off(eventType: "kick", listener: (...args: any[]) => void): boolean;
    public off(
        eventType: string,
        listener: ((...args: any[]) => void) | string
    ): boolean {
        return this.eventManager.off(eventType, listener as any);
    }
}
