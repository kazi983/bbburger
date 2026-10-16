import type { IncomingMessage } from "http";
import type { Server, Socket } from "socket.io";

let currentOrderStatus = "Received";

type SessionRequest = IncomingMessage & {
  session?: {
    userId?: number;
  };
};

export function registerOrderSockets(io: Server) {
  io.on("connection", (socket: Socket) => {
    console.log("client connected", socket.id);

    const request = socket.request as SessionRequest;
    const userId = request.session?.userId;
    const isStaff = typeof userId === "number";

    if (isStaff) {
      socket.join("staff");
    }

    // Only authenticated staff can update the order status.
    socket.on("status_updated", (newStatus: string) => {
      if (!isStaff) {
        return;
      }

      currentOrderStatus = newStatus;

      console.log(`Order status updated to: ${newStatus}`);

      // Customers still need status updates for tracking.
      io.emit("new_status", currentOrderStatus);
    });

    // create a room for customers to track their order.
    socket.on("track_order", (orderId: number) =>
      socket.join(`order:${orderId}`),
    );

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });
}
