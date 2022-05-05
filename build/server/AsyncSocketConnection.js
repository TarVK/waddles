"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const config_1 = require("../config");
class AsyncSocketConnection {
    /**
     * Creates a new socket connection
     * @param socket The socket.io socket
     */
    constructor(socket) {
        this.socket = socket;
        this.listenerMapping = {};
    }
    /**
     * Adds a listener to a specific message
     * @param message The message to add the listener to
     * @param listener The listener to be added
     * @param label A label for the added listener
     */
    on(message, listener, label = "") {
        // Create the listener for the socket
        const l = (...args) => {
            // Forward the event
            const resp = listener(...args);
            // If the response is not undefined, return this as through a callback as a response
            if (resp !== undefined) {
                const last = args[args.length - 1];
                if (last instanceof Function) {
                    if (resp instanceof Promise) {
                        resp.then(last);
                    }
                    else {
                        last(resp);
                    }
                }
            }
        };
        // Add the listener to the socket
        this.socket.on(message, l);
        // Store the mapping in case the listener should later be removed
        if (!this.listenerMapping[message])
            this.listenerMapping[message] = [];
        this.listenerMapping[message].push([l, listener, label]);
    }
    off(message, listener) {
        // Look up the listener function that maps to this
        const mappings = this.listenerMapping[message];
        if (!mappings)
            return;
        const mapping = typeof listener == "string"
            ? mappings.find(([, , label]) => label == listener)
            : mappings.find(([, source]) => source == listener);
        if (!mapping)
            return;
        // Remove the function that maps to the listener
        this.socket.off(message, mapping[0]);
    }
    /**
     * Emits data to the server
     * @param message The message to emit data to
     * @param args The arguments to pass to the message
     */
    emit(message, ...args) {
        this.socket.emit(message, ...args);
    }
    /**
     * Starts a socket server
     * @param listener The callback for when a connection is created
     * @param server The http server to use
     */
    static startServer(listener, server) {
        const io = socket_io_1.listen(server || config_1.domain.socket.port, { path: "/cards" });
        io.on("connection", client => {
            listener(new AsyncSocketConnection(client));
        });
    }
}
exports.AsyncSocketConnection = AsyncSocketConnection;
//# sourceMappingURL=AsyncSocketConnection.js.map