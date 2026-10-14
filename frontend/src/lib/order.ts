import type { OrderMessage } from "../stores/order";
import { socket } from "./socket";

socket.on("connect", () => {
  console.log("Connected to server");
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("send_order", (message: OrderMessage) => {});
