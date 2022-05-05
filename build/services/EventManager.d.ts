export declare class EventManager {
    protected listeners: {
        [type: string]: {
            label?: string;
            listener: (...args: any) => void;
        }[];
    };
    /**
     * Adds a listener to the manager
     * @param eventType The type of event to listen to
     * @param listener The listener to be added
     * @param label The label to add it under, for easier future removal
     */
    on(eventType: string, listener: (...args: any[]) => void, label?: string): void;
    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param label The label of the listener
     * @returns Whether a listener was found and removed
     */
    off(eventType: string, label: string): boolean;
    /**
     * Removes a listener from the manager
     * @param eventType The type of event that was listened to
     * @param listener The listener to be removed
     * @returns Whether a listener was found and removed
     */
    off(eventType: string, listener: (...args: any[]) => void): boolean;
    /**
     * Emits an event
     * @param eventType The type of event to emit
     * @param args The arguments to pass to the listener
     */
    emit(eventType: string, ...args: any[]): void;
}
