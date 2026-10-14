import type { Server, Socket } from "socket.io";
import { handleReceivedOrder } from "../controllers/OrderController";

export function registerOrderSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("client connected", socket.id);

    socket.on("receive_order", (socket, payload) => handleReceivedOrder);

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });
}
