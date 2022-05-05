/// <reference types="socket.io" />
/// <reference types="node" />
import { Server as HTTPServer } from "http";
import { ISome } from "../_types/ISome";
export declare class AsyncSocketConnection {
    protected socket: SocketIO.Socket;
    protected listenerMapping: {
        [message: string]: [(...args: any[]) => void, (...args: any[]) => any | Promise<any>, string][];
    };
    /**
     * Creates a new socket connection
     * @param socket The socket.io socket
     */
    protected constructor(socket: SocketIO.Socket);
    /**
     * Adds a listener to a specific message
     * @param message The message to add the listener to
     * @param listener The listener to be added
     * @param label A label for the added listener
     */
    on<T extends any[], R extends ISome>(message: string, listener: (...args: T) => void | R | Promise<R>, label?: string): void;
    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param listener The listener to be removed
     */
    off<T extends any[]>(message: string, listener: (...args: T) => void): void;
    /**
     * Removes a listener from a specific message
     * @param message The message to remove the listener from
     * @param label The label of the listener to be removed
     */
    off<T extends any[]>(message: string, label: string): void;
    /**
     * Emits data to the server
     * @param message The message to emit data to
     * @param args The arguments to pass to the message
     */
    emit<T extends any[]>(message: string, ...args: T): void;
    /**
     * Starts a socket server
     * @param listener The callback for when a connection is created
     * @param server The http server to use
     */
    static startServer(listener: (connection: AsyncSocketConnection) => void, server?: HTTPServer): void;
}
