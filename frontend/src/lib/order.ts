import { socket } from "./socket";

const API_URL = import.meta.env.PUBLIC_API_URL;

export function sendStatusUpdate(orderId: number, status: string) {
  fetch(`${API_URL}/api/orders/update-status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      orderId,
      status,
    }),
  }).then((res) => {
    if (!res.ok) {
      console.error("Failed to update order status");
    } else {
      socket.emit("updated_status", status);
    }
  });
}
