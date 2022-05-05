import {Player} from "./game/Player";
import {Room} from "./game/Room";
import {ActionState, IDataHook, DataLoader} from "model-react";
import {SocketModel} from "./socketUtils/SocketModel";
import {Self} from "./game/Self";
import {getWordLists} from "../services/lists/getWordLists";
import {createToast} from "../components/NotificationManager/createToast";

export class ApplicationClass extends SocketModel {
    protected player = new DataLoader<Self | undefined>(async () => {
        const ID = (await this.socket.emitAsync("players/me")) as string;
        return await Self.create(ID);
    }, undefined);

    protected room = new ActionState<Room>();

    /**
     * Joins a room with the given ID, or a random room if no ID is specified
     * @param ID The room ID
     */
    public async joinRoom(ID?: string): Promise<Room> {
        const room = this.getRoom(null);
        if (room && room?.getID() == ID) return room;

        return this.room.addAction(async () => {
            const resp: any = await this.socket.emitAsync("rooms/connect", ID);
            if (resp.success) {
                location.hash = resp.ID;
                const room = await Room.joinRoom(resp.ID);
                await this.loadRoomWordList(room);
                return room;
            } else {
                throw resp;
            }
        }, true);
    }

    /**
     * Loads a word list into the room
     * @param room The room to load the list for
     */
    protected async loadRoomWordList(room: Room): Promise<void> {
        const isAdmin = room.getAdmin(null).getID() == this.player.get(null)?.getID();
        if (isAdmin) {
            const prevName = localStorage.getItem("lastWordListName");

            const lists = getWordLists();
            const list =
                lists.find(l => l.name == prevName) ??
                lists.find(l => l.name == "english-5 wordle") ??
                lists[0];

            try {
                const words = await list.get();
                room.setSettings({
                    ...room.getSettings(null),
                    wordList: words,
                    wordListName: list.name,
                });
            } catch (e) {
                createToast("Word list loading failed!");
                console.log(e);
            }
        }
    }

    // Getters
    /**
     * Retrieves the player that this client is representing
     * @param hook The data hook
     * @returns The player or undefined if still loading
     */
    public getPlayer(hook: IDataHook): Self | undefined {
        return this.player.get(hook);
    }

    /**
     * Retrieves the room that is currently connected to
     * @param hook The data hook
     * @returns The room
     */
    public getRoom(hook: IDataHook): Room | undefined {
        return this.room.getLatest(hook);
    }

    /**
     * Retrieves whether this client is an admin
     * @param hook The data hook to subscribe to changes
     * @returns Whether player is admin
     */
    public isAdmin(hook: IDataHook): boolean {
        const room = this.getRoom(hook);
        const admin = room?.getAdmin(hook);
        const player = this.getPlayer(hook);
        return player?.is(admin) || false;
    }

    /**
     * Retrieves whether this client is currently the word chooser
     * @param hook The data hook to subscribe to changes
     * @returns Whether player is chooser
     */
    public isChooser(hook: IDataHook): boolean {
        const room = this.getRoom(hook);
        const judge = room?.getChooser(hook);
        const player = this.getPlayer(hook);
        return player?.is(judge) || false;
    }
}

export const Application = new ApplicationClass();
(window as any).a = Application; // For easy debugging
