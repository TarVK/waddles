/// <reference types="node" />
import { Server as HTTPServer } from "http";
/**
 * Starts the socket server
 * @param server The http server to use, or undefined to let the socket create its own server
 */
export declare function startApplication(server?: HTTPServer): Promise<void>;
