import type { Server, Socket } from "socket.io";

export function registerOrderSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("client connected", socket.id);
  });
}
