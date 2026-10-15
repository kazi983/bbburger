import type { Order } from "../../../shared/types";

const API_URL = import.meta.env.PUBLIC_API_URL;

export async function sendStatusUpdate(orderId: number, status: string) {
  try {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok)
      console.error("Failed to update order status:", res.statusText);
  } catch (err) {
    console.error("Network error:", err);
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_URL}/orders/`);
    if (!res.ok) console.error("Failed to fetch orders:", res.statusText);
    return res.json();
  } catch (err) {
    console.error("Network error:", err);
    return [];
  }
}
