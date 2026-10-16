import type { IncomingMessage } from "http";
import type { Server, Socket } from "socket.io";
import { findOrderById } from "../models/orderModel";

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

    // create a room for customers to track their order.
    socket.on("track_order", (orderId: number) => {
      socket.join(`order:${orderId}`);
      const order = findOrderById(orderId);
      if (order) socket.emit("order_status", order.status);
    });

    socket.on("disconnect", () => {
      console.log("client disconnected");
    });
  });
}
