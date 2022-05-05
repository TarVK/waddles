import { Player } from "./Player";
import { EventManager } from "../../services/EventManager";
import { IGameSettings } from "../../_types/game/IGameSettings";
import { IAttempt } from "../../_types/game/IAttempt";
import { IGameState } from "../../_types/game/IGameState";
import { TOptional } from "../../_types/TOptional";
export declare class Room {
    protected eventManager: EventManager;
    protected ID: string;
    protected maxPlayerCount: number;
    protected isPrivat: boolean;
    protected settings: IGameSettings;
    protected players: Player[];
    protected previousChooser: Player | undefined;
    protected previousGuesser: Player | undefined;
    protected state: IGameState;
    protected word: string;
    /**
     * Creates a new room for players
     * @param ID The ID of the room
     * @param isPrivate Whether this is a private room
     */
    constructor(ID?: string, isPrivat?: boolean);
    /**
     * Retrieves the identifier of this room
     * @returns The identifier
     */
    getID(): string;
    /**
     * Retrieves whether this room is private
     * @returns Whether this room is private
     */
    isPrivate(): boolean;
    /**
     * Retrieves the players that are in this room
     * @returns The players
     */
    getPlayers(): Player[];
    /**
     * Retrieves the player that is the administrator of this room
     * @returns The administrator
     */
    getAdmin(): Player | undefined;
    /**
     * Retrieves what the maximum number of players allowed for this room s
     * @returns The maximal number of allowed players in this room
     */
    getMaxPlayerCount(): number;
    /**
     * Adds a player to this room
     * @param player The player to be added
     */
    addPlayer(player: Player): void;
    /**
     * Removes a player from this room
     * @param client The client to be removed
     */
    removePlayer(player: Player): void;
    /**
     * Whether the player is currently choosing the word
     * @param player The player to be checked
     * @returns Whether the player is choosing
     */
    isPlayerChooser(player: Player): boolean;
    /**
     * Kicks the specified player from the room
     * @param player The player to be kicked
     * @param message An optional message
     */
    kickPlayer(player: Player, message?: string): void;
    /**
     * Sets the game state
     * @param state The new state of the game
     */
    protected setState(state: TOptional<IGameState, "round">): void;
    /**
     * Starts the game
     */
    startGame(): void;
    /**
     * Starts the next round
     */
    nextRound(): void;
    /**
     * Starts the process of choosing a word
     * @param round The round that's being started
     */
    protected startRound(round: number): void;
    /**
     * Sets the word that is being guessed
     * @param word The word to be guessed
     * @param round The new round value
     */
    protected setWord(word: string, round?: number): void;
    /**
     * Checks the player's attempts, and updates the game state accordingly
     * @param player The player whose guess to be checked
     */
    checkPlayerAttempts(player: Player): void;
    /**
     * Updates the settings data
     * @param settings The new settings to be used
     */
    setSettings(settings: IGameSettings): void;
    /**
     * Updates the accessibility data
     * @param privat Whether this room is private
     * @param maxPlayerCount The maximal number of players in this room
     */
    setAccessibility(privat: boolean, maxPlayerCount: number): void;
    /**
     * Notifies listeners about a potential accessibility change
     */
    protected emitAccesibilityChange(): void;
    /**
     * Rates the given attempt and determines the correctness of the letters.
     * It also either includes or excludes the characters in the attempt, depending on the room settings (so they either are or are not visible to other players)
     * @param attempt The attempt to be scored
     * @returns The scoring
     */
    rate(attempt: string): IAttempt;
    /**
     * Broadcasts a message to all players in this room
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    broadcast<T extends any[]>(message: string, ...args: T): void;
    /**
     * Adds an event listener to detect when room data is altered
     * @param eventType The accessibility change event
     * @param listener The listener to register
     * @param label A label for the listener
     */
    on(eventType: "accessibilityChange", listener: (privat: boolean, maxPlayerCount: number, playerCount: number) => void, label?: string): void;
    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    off(eventType: "accessibilityChange", label: string): boolean;
    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    off(eventType: "accessibilityChange", listener: (...args: any[]) => void): boolean;
}
