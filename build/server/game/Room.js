"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuidv4_1 = require("uuidv4");
const EventManager_1 = require("../../services/EventManager");
const withErrorHandling_1 = require("../services/withErrorHandling");
class Room {
    /**
     * Creates a new room for players
     * @param ID The ID of the room
     * @param isPrivate Whether this is a private room
     */
    constructor(ID = uuidv4_1.uuid(), isPrivat = false) {
        this.eventManager = new EventManager_1.EventManager();
        this.maxPlayerCount = 2;
        this.settings = {
            attempts: 6,
            rounds: 3,
            scoring: "speed",
            wordMode: "randomized",
            wordList: ["doggo"],
            wordListName: "fake",
            seeOpponents: false,
        };
        this.players = [];
        this.state = {
            status: "waiting",
            round: 0,
        };
        this.ID = ID;
        this.isPrivat = isPrivat;
    }
    // Getters
    /**
     * Retrieves the identifier of this room
     * @returns The identifier
     */
    getID() {
        return this.ID;
    }
    /**
     * Retrieves whether this room is private
     * @returns Whether this room is private
     */
    isPrivate() {
        return this.isPrivat;
    }
    /**
     * Retrieves the players that are in this room
     * @returns The players
     */
    getPlayers() {
        return this.players;
    }
    /**
     * Retrieves the player that is the administrator of this room
     * @returns The administrator
     */
    getAdmin() {
        return this.players[0];
    }
    /**
     * Retrieves what the maximum number of players allowed for this room s
     * @returns The maximal number of allowed players in this room
     */
    getMaxPlayerCount() {
        return this.maxPlayerCount;
    }
    // Player management
    /**
     * Adds a player to this room
     * @param player The player to be added
     */
    addPlayer(player) {
        if (this.players.includes(player))
            return;
        this.players.push(player);
        // Make sure the player knows he/she is added to this room
        player.setRoom(this);
        this.players.forEach(p => {
            if (p == player)
                return;
            p.share(player);
            player.share(p);
        });
        this.broadcast(`rooms/${this.ID}/addPlayer`, player.getID());
        // Setup socket listeners for the player
        const socket = player.getSocket();
        socket.on(`rooms/${this.ID}/retrieve`, () => withErrorHandling_1.withErrorHandling(() => ({
            accessibility: {
                privat: this.isPrivat,
                maxPlayerCount: this.maxPlayerCount,
            },
            ID: this.ID,
            playerIDs: this.players.map(p => p.getID()),
            settings: this.settings,
            state: this.state,
        })), this.ID);
        const onlyIfChooser = (func) => {
            if (!this.isPlayerChooser(player))
                return { errorMessage: "not permitted", errorCode: -2 };
            const res = withErrorHandling_1.withErrorHandling(func);
            if (res)
                return res;
            return { success: true };
        };
        socket.on(`rooms/${this.ID}/enterWord`, (word) => onlyIfChooser(() => {
            this.setWord(word);
        }), this.ID);
        const onlyIfAdmin = (func) => {
            if (this.getAdmin() != player)
                return { errorMessage: "not permitted", errorCode: -1 };
            const res = withErrorHandling_1.withErrorHandling(func);
            if (res)
                return res;
            return { success: true };
        };
        socket.on(`rooms/${this.ID}/start`, () => onlyIfAdmin(() => {
            this.startGame();
        }), this.ID);
        socket.on(`rooms/${this.ID}/nextRound`, () => onlyIfAdmin(() => {
            this.nextRound();
        }), this.ID);
        socket.on(`rooms/${this.ID}/kickPlayer`, (playerID) => onlyIfAdmin(() => {
            const p = this.players.find(player => player.getID() == playerID);
            if (p)
                this.kickPlayer(p);
        }), this.ID);
        socket.on(`rooms/${this.ID}/setAccessibility`, ({ privat, maxPlayerCount }) => onlyIfAdmin(() => {
            this.setAccessibility(privat, Math.max(2, maxPlayerCount));
        }), this.ID);
        socket.on(`rooms/${this.ID}/setSettings`, settings => onlyIfAdmin(() => {
            this.setSettings(settings);
        }), this.ID);
        this.emitAccesibilityChange();
    }
    /**
     * Removes a player from this room
     * @param client The client to be removed
     */
    removePlayer(player) {
        const index = this.players.indexOf(player);
        if (index == -1)
            return;
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
        if (this.isPlayerChooser(player))
            this.nextRound();
        this.emitAccesibilityChange();
    }
    /**
     * Whether the player is currently choosing the word
     * @param player The player to be checked
     * @returns Whether the player is choosing
     */
    isPlayerChooser(player) {
        return this.state.chooserID == player.getID();
    }
    /**
     * Kicks the specified player from the room
     * @param player The player to be kicked
     * @param message An optional message
     */
    kickPlayer(player, message = "") {
        this.broadcast(`rooms/${this.ID}/kickPlayer`, player.getID(), message);
        player.setRoom(null);
    }
    // Game
    /**
     * Sets the game state
     * @param state The new state of the game
     */
    setState(state) {
        this.state = Object.assign({ round: this.state.round }, state);
        this.broadcast(`rooms/${this.ID}/setState`, this.state);
    }
    /**
     * Starts the game
     */
    startGame() {
        this.players.forEach(player => {
            player.setScore(0);
        });
        this.startRound(1);
    }
    /**
     * Starts the next round
     */
    nextRound() {
        const nextRound = this.state.round + 1;
        if (nextRound <= this.settings.rounds) {
            this.startRound(nextRound);
        }
        else {
            this.setState(Object.assign(Object.assign({}, this.state), { status: "waiting" }));
        }
    }
    /**
     * Starts the process of choosing a word
     * @param round The round that's being started
     */
    startRound(round) {
        var _a;
        // Return the played cards
        this.players.forEach(player => {
            player.setAttempts([]);
        });
        // Choose the new word
        if (this.settings.wordMode == "entered") {
            const ID = (_a = this.previousChooser) === null || _a === void 0 ? void 0 : _a.getID();
            const currentIndex = ID
                ? this.players.findIndex(player => player.getID() == ID)
                : -1;
            const chooser = this.players[(currentIndex + 1) % this.players.length];
            this.previousChooser = chooser;
            this.setState({
                round,
                status: "choosingWord",
                chooserID: chooser === null || chooser === void 0 ? void 0 : chooser.getID(),
            });
        }
        else {
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
    setWord(word, round = this.state.round) {
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
    checkPlayerAttempts(player) {
        if (this.state.status == "playing") {
            const allowedAttempts = this.settings.attempts;
            // Determine if there's a new winner of this round according to the scoring mode
            const mode = this.settings.scoring;
            let winner;
            let draw = false;
            const playersAttempts = player.getAttempts();
            const guessedWord = player.guessedWord();
            const isLastAttempt = playersAttempts.length == allowedAttempts;
            if (mode == "speed") {
                if (guessedWord)
                    winner = player;
                else if (isLastAttempt) {
                    const allPlayersFinished = this.players.every(player => player.getAttempts().length == allowedAttempts);
                    if (allPlayersFinished)
                        draw = true;
                }
            }
            else if (mode == "attempts") {
                if (guessedWord || isLastAttempt) {
                    const allPlayersFinished = this.players.every(player => player.getAttempts().length == allowedAttempts ||
                        player.guessedWord());
                    if (allPlayersFinished) {
                        const minGuesses = this.players.reduce((min, player) => Math.min(player.getAttempts().length, min), Infinity);
                        const playersWithMinGuesses = this.players.filter(player => player.getAttempts().length == minGuesses);
                        if (playersWithMinGuesses.length == 1)
                            winner = playersWithMinGuesses[0];
                        else
                            draw = true;
                    }
                }
            }
            // Update the state according to the derived data
            if (winner || draw) {
                this.setState({
                    status: "showingWinner",
                    winnerID: winner === null || winner === void 0 ? void 0 : winner.getID(),
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
    setSettings(settings) {
        this.settings = settings;
        this.broadcast(`rooms/${this.ID}/setSettings`, settings);
    }
    /**
     * Updates the accessibility data
     * @param privat Whether this room is private
     * @param maxPlayerCount The maximal number of players in this room
     */
    setAccessibility(privat, maxPlayerCount) {
        this.isPrivat = privat;
        this.maxPlayerCount = maxPlayerCount;
        this.broadcast(`rooms/${this.ID}/setAccessibility`, { privat, maxPlayerCount });
        this.emitAccesibilityChange();
    }
    /**
     * Notifies listeners about a potential accessibility change
     */
    emitAccesibilityChange() {
        this.eventManager.emit("accessibilityChange", this.isPrivat, this.maxPlayerCount, this.players.length);
    }
    /**
     * Rates the given attempt and determines the correctness of the letters.
     * It also either includes or excludes the characters in the attempt, depending on the room settings (so they either are or are not visible to other players)
     * @param attempt The attempt to be scored
     * @returns The scoring
     */
    rate(attempt) {
        var _a;
        const chars = attempt.split("");
        const wordChars = ((_a = this.word) !== null && _a !== void 0 ? _a : "").split("");
        // Map the characters to those tha match, or aren't known yet, while removing all matched chars from the word chars
        const matchesReversed = [];
        for (let i = wordChars.length - 1; i >= 0; i--) {
            const char = chars[i];
            const matches = char == wordChars[i];
            if (matches)
                wordChars.splice(i, 1);
            matchesReversed.push({
                type: matches ? "matches" : "unknown",
                letter: char,
            });
        }
        const matched = matchesReversed.reverse();
        // Divide the remaining chars
        const mapped = matched.map(data => {
            if (data.type == "matches")
                return data;
            const index = wordChars.indexOf(data.letter);
            if (index == -1)
                return Object.assign(Object.assign({}, data), { type: "absent" });
            wordChars.splice(index, 1);
            return Object.assign(Object.assign({}, data), { type: "contains" });
        });
        // Remover the characters if needed
        if (this.settings.seeOpponents)
            return mapped;
        else
            return mapped.map(({ type }) => ({ type }));
    }
    // Utility
    /**
     * Broadcasts a message to all players in this room
     * @param message The message to be broadcasted
     * @param args The arguments to supply
     */
    broadcast(message, ...args) {
        this.players.forEach(player => {
            player.getSocket().emit(message, ...args);
        });
    }
    on(eventType, listener, label) {
        this.eventManager.on(eventType, listener, label);
    }
    off(eventType, listener) {
        return this.eventManager.off(eventType, listener);
    }
}
exports.Room = Room;
const serializeAnsweringPlayers = (players) => players.map(({ player, revealed }) => ({ playerID: player.getID(), revealed }));
//# sourceMappingURL=Room.js.map