"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventManager {
    constructor() {
        this.listeners = {};
    }
    /**
     * Adds a listener to the manager
     * @param eventType The type of event to listen to
     * @param listener The listener to be added
     * @param label The label to add it under, for easier future removal
     */
    on(eventType, listener, label) {
        if (!this.listeners[eventType])
            this.listeners[eventType] = [];
        if (this.listeners[eventType].find(l => l.listener == listener))
            return;
        this.listeners[eventType].push({ label, listener });
    }
    off(eventType, listener) {
        if (!this.listeners[eventType])
            return false;
        const listeners = this.listeners[eventType];
        const index = listeners.findIndex(l => l.listener == listener || l.label == listener);
        if (index != -1) {
            listeners.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Emits an event
     * @param eventType The type of event to emit
     * @param args The arguments to pass to the listener
     */
    emit(eventType, ...args) {
        if (!this.listeners[eventType])
            return;
        this.listeners[eventType].forEach(({ listener }) => listener(...args));
    }
}
exports.EventManager = EventManager;
//# sourceMappingURL=EventManager.js.map