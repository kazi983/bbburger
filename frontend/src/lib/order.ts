import type { Order } from "../../../shared/types";

const API_URL = import.meta.env.PUBLIC_API_URL;

// Prefer the server's { message } body; fall back to the HTTP status
async function toError(res: Response, fallback: string) {
  const body = await res.json().catch(() => null);
  return new Error(body?.message ?? `${fallback} (${res.status})`);
}

export async function sendStatusUpdate(orderId: number, status: string) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw await toError(res, "Failed to update order status");
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_URL}/orders/`);
  if (!res.ok) throw await toError(res, "Failed to fetch orders");
  return res.json();
}
