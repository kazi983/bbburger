import type { Server, Socket } from "socket.io";

let currentOrderStatus = "Received";

export function registerOrderSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("client connected", socket.id);

    // send actual status
    socket.emit("actual_order_status", currentOrderStatus);

    // dashboard send new status
    socket.on("updated_status", (newStatus: string) => {
      currentOrderStatus = newStatus;

      console.log(`Order status updated to: ${newStatus}`);

      // send new status to everyone
      io.emit("new_status", currentOrderStatus);
    });

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });
}
