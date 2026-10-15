import { io } from "socket.io-client";

export const socket = io(import.meta.env.PUBLIC_API_URL);
