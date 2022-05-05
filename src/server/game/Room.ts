import {Player} from "./Player";
import {uuid} from "uuidv4";
import {IRoomData} from "../../_types/game/IRoomData";
import {EventManager} from "../../services/EventManager";
import {withErrorHandling} from "../services/withErrorHandling";
import {IGameSettings} from "../../_types/game/IGameSettings";
import {IAttempt} from "../../_types/game/IAttempt";
import {ILetterStatus} from "../../_types/game/ILetterStatus";
import {IError} from "../../_types/game/IError";
import {IGameState} from "../../_types/game/IGameState";
import {TOptional} from "../../_types/TOptional";

export class Room {
    protected eventManager: EventManager = new EventManager();

    protected ID: string;
    protected maxPlayerCount: number = 2;
    protected isPrivat: boolean;

    protected settings: IGameSettings = {
        attempts: 6,
        rounds: 3,
        scoring: "speed",
        wordMode: "randomized",
        wordList: ["doggo"],
        wordListName: "fake",
        seeOpponents: false,
    };

    protected players: Player[] = [];

    protected previousChooser: Player | undefined;
    protected previousGuesser: Player | undefined;

    protected state: IGameState = {
        status: "waiting",
        round: 0,
    };
    protected word: string;

    /**
     * Creates a new room for players
     * @param ID The ID of the room
     * @param isPrivate Whether this is a private room
     */
    public constructor(ID: string = uuid(), isPrivat: boolean = false) {
        this.ID = ID;
        this.isPrivat = isPrivat;
    }

    // Getters
    /**
     * Retrieves the identifier of this room
     * @returns The identifier
     */
    public getID(): string {
        return this.ID;
    }

    /**
     * Retrieves whether this room is private
     * @returns Whether this room is private
     */
    public isPrivate(): boolean {
        return this.isPrivat;
    }

    /**
     * Retrieves the players that are in this room
     * @returns The players
     */
    public getPlayers(): Player[] {
        return this.players;
    }

    /**
     * Retrieves the player that is the administrator of this room
     * @returns The administrator
     */
    public getAdmin(): Player | undefined {
        return this.players[0];
    }

    /**
     * Retrieves what the maximum number of players allowed for this room s
     * @returns The maximal number of allowed players in this room
     */
    public getMaxPlayerCount(): number {
        return this.maxPlayerCount;
    }

    // Player management
    /**
     * Adds a player to this room
     * @param player The player to be added
     */
    public addPlayer(player: Player): void {
        if (this.players.includes(player)) return;
        this.players.push(player);

        // Make sure the player knows he/she is added to this room
        player.setRoom(this);
        this.players.forEach(p => {
            if (p == player) return;
            p.share(player);
            player.share(p);
        });
        this.broadcast(`rooms/${this.ID}/addPlayer`, player.getID());

        // Setup socket listeners for the player
        const socket = player.getSocket();
        socket.on(
            `rooms/${this.ID}/retrieve`,
            (): IRoomData | IError =>
                withErrorHandling(() => ({
                    accessibility: {
                        privat: this.isPrivat,
                        maxPlayerCount: this.maxPlayerCount,
                    },
                    ID: this.ID,
                    playerIDs: this.players.map(p => p.getID()),
                    settings: this.settings,
                    state: this.state,
                })),
            this.ID
        );

        const onlyIfChooser = (func: () => any) => {
            if (!this.isPlayerChooser(player))
                return {errorMessage: "not permitted", errorCode: -2};

            const res = withErrorHandling(func);
            if (res) return res;
            return {success: true};
        };
        socket.on(
            `rooms/${this.ID}/enterWord`,
            (word: string) =>
                onlyIfChooser(() => {
                    this.setWord(word);
                }),
            this.ID
        );

        const onlyIfAdmin = (func: () => any) => {
            if (this.getAdmin() != player)
                return {errorMessage: "not permitted", errorCode: -1};

            const res = withErrorHandling(func);
            if (res) return res;
            return {success: true};
        };
        socket.on(
            `rooms/${this.ID}/start`,
            () =>
                onlyIfAdmin(() => {
                    this.startGame();
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/nextRound`,
            () =>
                onlyIfAdmin(() => {
                    this.nextRound();
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/kickPlayer`,
            (playerID: string) =>
                onlyIfAdmin(() => {
                    const p = this.players.find(player => player.getID() == playerID);
                    if (p) this.kickPlayer(p);
                }),
            this.ID
        );
        socket.on(
            `rooms/${this.ID}/setAccessibility`,
            ({privat, maxPlayerCount}) =>
                onlyIfAdmin(() => {
                    this.setAccessibility(privat, Math.max(2, maxPlayerCount));
                }),
            this.ID
        );

        socket.on(
            `rooms/${this.ID}/setSettings`,
            settings =>
                onlyIfAdmin(() => {
                    this.setSettings(settings);
                }),
            this.ID
        );

        this.emitAccesibilityChange();
    }

    /**
     * Removes a player from this room
     * @param client The client to be removed
     */
    public removePlayer(player: Player): void {
        const index = this.players.indexOf(player);
        if (index == -1) return;
        this.players.splice(index, 1);

        // Make sure the player knows he/she is removed from this room
        player.setRoom(null);
        this.players.forEach(p => {
            p.unshare(player);
            player.unshare(p);
        });
        this.broadcast(`rooms/${this.ID}/removePlayer`, player.getID());

        // Remove all socket listeners of this room
        const socket = player.getSocket();
        socket.off(`rooms/${this.ID}/retrieve`, this.ID);
        socket.off(`rooms/${this.ID}/enterWord`, this.ID);
        socket.off(`rooms/${this.ID}/kickPlayer`, this.ID);
        socket.off(`rooms/${this.ID}/setAccessibility`, this.ID);

        // Move to the next round
        if (this.isPlayerChooser(player)) this.nextRound();

        this.emitAccesibilityChange();
    }

    /**
     * Whether the player is currently choosing the word
     * @param player The player to be checked
     * @returns Whether the player is choosing
     */
    public isPlayerChooser(player: Player): boolean {
        return this.state.chooserID == player.getID();
    }

    /**
     * Kicks the specified player from the room
     * @param player The player to be kicked
     * @param message An optional message
     */
    public kickPlayer(player: Player, message: string = ""): void {
        this.broadcast(`rooms/${this.ID}/kickPlayer`, player.getID(), message);
        player.setRoom(null);
    }

    // Game
    /**
     * Sets the game state
     * @param state The new state of the game
     */
    protected setState(state: TOptional<IGameState, "round">): void {
        this.state = {round: this.state.round, ...state};
        this.broadcast(`rooms/${this.ID}/setState`, this.state);
    }

    /**
     * Starts the game
     */
    public startGame(): void {
        this.players.forEach(player => {
            player.setScore(0);
        });
        this.startRound(1);
    }

    /**
     * Starts the next round
     */
    public nextRound(): void {
        const nextRound = this.state.round + 1;
        if (nextRound <= this.settings.rounds) {
            this.startRound(nextRound);
        } else {
            this.setState({
                ...this.state,
                status: "waiting",
            });
        }
    }

    /**
     * Starts the process of choosing a word
     * @param round The round that's being started
     */
    protected startRound(round: number): void {
        // Return the played cards
        this.players.forEach(player => {
            player.setAttempts([]);
        });

        // Choose the new word
        if (this.settings.wordMode == "entered") {
            const ID = this.previousChooser?.getID();
            const currentIndex = ID
                ? this.players.findIndex(player => player.getID() == ID)
                : -1;
            const chooser = this.players[(currentIndex + 1) % this.players.length];

            this.previousChooser = chooser;
            this.setState({
                round,
                status: "choosingWord",
                chooserID: chooser?.getID(),
            });
        } else {
            const words = this.settings.wordList;
            const index = Math.floor(Math.random() * words.length);
            this.setWord(words[index], round);
        }
    }

    /**
     * Sets the word that is being guessed
     * @param word The word to be guessed
     * @param round The new round value
     */
    protected setWord(word: string, round: number = this.state.round) {
        this.word = word;
        this.setState({
            round,
            chooserID: this.state.chooserID,
            status: "playing",
        });
    }

    /**
     * Checks the player's attempts, and updates the game state accordingly
     * @param player The player whose guess to be checked
     */
    public checkPlayerAttempts(player: Player) {
        if (this.state.status == "playing") {
            const allowedAttempts = this.settings.attempts;

            // Determine if there's a new winner of this round according to the scoring mode
            const mode = this.settings.scoring;
            let winner: Player | undefined;
            let draw: boolean = false;

            const playersAttempts = player.getAttempts();
            const guessedWord = player.guessedWord();
            const isLastAttempt = playersAttempts.length == allowedAttempts;
            if (mode == "speed") {
                if (guessedWord) winner = player;
                else if (isLastAttempt) {
                    const allPlayersFinished = this.players.every(
                        player => player.getAttempts().length == allowedAttempts
                    );
                    if (allPlayersFinished) draw = true;
                }
            } else if (mode == "attempts") {
                if (guessedWord || isLastAttempt) {
                    const allPlayersFinished = this.players.every(
                        player =>
                            player.getAttempts().length == allowedAttempts ||
                            player.guessedWord()
                    );
                    if (allPlayersFinished) {
                        const minGuesses = this.players.reduce(
                            (min, player) => Math.min(player.getAttempts().length, min),
                            Infinity
                        );
                        const playersWithMinGuesses = this.players.filter(
                            player => player.getAttempts().length == minGuesses
                        );
                        if (playersWithMinGuesses.length == 1)
                            winner = playersWithMinGuesses[0];
                        else draw = true;
                    }
                }
            }

            // Update the state according to the derived data
            if (winner || draw) {
                this.setState({
                    status: "showingWinner",
                    winnerID: winner?.getID(),
                });
                if (winner) {
                    winner.setScore(winner.getScore() + 1);
                    winner.setTotalScore(winner.getTotalScore() + 1);
                }
                return;
            }
        }
    }

    /**
     * Updates the settings data
     * @param settings The new settings to be used
     */
    public setSettings(settings: IGameSettings): void {
        this.settings = settings;
        this.broadcast(`rooms/${this.ID}/setSettings`, settings);
    }

    /**
     * Updates the accessibility data
     * @param privat Whether this room is private
     * @param maxPlayerCount The maximal number of players in this room
     */
    public setAccessibility(privat: boolean, maxPlayerCount: number): void {
        this.isPrivat = privat;
        this.maxPlayerCount = maxPlayerCount;
        this.broadcast(`rooms/${this.ID}/setAccessibility`, {privat, maxPlayerCount});
        this.emitAccesibilityChange();
    }

    /**
     * Notifies listeners about a potential accessibility change
     */
    protected emitAccesibilityChange(): void {
        this.eventManager.emit(
            "accessibilityChange",
            this.isPrivat,
            this.maxPlayerCount,
            this.players.length
        );
    }

    /**
     * Rates the given attempt and determines the correctness of the letters.
     * It also either includes or excludes the characters in the attempt, depending on the room settings (so they either are or are not visible to other players)
     * @param attempt The attempt to be scored
     * @returns The scoring
     */
    public rate(attempt: string): IAttempt {
        const chars = attempt.split("");
        const wordChars = (this.word ?? "").split("");

        // Map the characters to those tha match, or aren't known yet, while removing all matched chars from the word chars
        const matchesReversed: ILetterStatus[] = [];
        for (let i = wordChars.length - 1; i >= 0; i--) {
            const char = chars[i];
            const matches = char == wordChars[i];
            if (matches) wordChars.splice(i, 1);
            matchesReversed.push({
                type: matches ? ("matches" as const) : ("unknown" as const),
                letter: char,
            });
        }
        const matched = matchesReversed.reverse();

        // Divide the remaining chars
        const mapped = matched.map<ILetterStatus>(data => {
            if (data.type == "matches") return data;

            const index = wordChars.indexOf(data.letter!);
            if (index == -1) return {...data, type: "absent"};

            wordChars.splice(index, 1);
            return {...data, type: "contains"};
        });

        // Remover the characters if needed
        if (this.settings.seeOpponents) return mapped;
        else return mapped.map(({type}) => ({type}));
    }

    // Utility
    /**
     * Broadcasts a message to all players in this room
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    public broadcast<T extends any[]>(message: string, ...args: T): void {
        this.players.forEach(player => {
            player.getSocket().emit(message, ...args);
        });
    }

    // Event handlers
    /**
     * Adds an event listener to detect when room data is altered
     * @param eventType The accessibility change event
     * @param listener The listener to register
     * @param label A label for the listener
     */
    public on(
        eventType: "accessibilityChange",
        listener: (privat: boolean, maxPlayerCount: number, playerCount: number) => void,
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
    public off(eventType: "accessibilityChange", label: string): boolean;

    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    public off(
        eventType: "accessibilityChange",
        listener: (...args: any[]) => void
    ): boolean;
    public off(
        eventType: string,
        listener: ((...args: any[]) => void) | string
    ): boolean {
        return this.eventManager.off(eventType, listener as any);
    }
}

const serializeAnsweringPlayers = (players: {player: Player; revealed: boolean}[]) =>
    players.map(({player, revealed}) => ({playerID: player.getID(), revealed}));
