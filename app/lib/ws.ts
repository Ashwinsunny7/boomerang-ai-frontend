import { io, type Socket } from "socket.io-client";
import { WS_BASE } from "../const";

let socket: Socket | null = null;

export function getSocket() {
    if (!socket) {
        socket = io(WS_BASE, { transports: ["websocket"] });
    }
    return socket;
}