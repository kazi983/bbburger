import type { Socket } from "socket.io";

import type { Request, Response } from "express";
import type { Order, OrderStatus } from "../../../shared/types";

type Items = {
  quantity: number;
  name: string;
};

type ReceivedOrder = {
  id: number;
  orderId: number;
  customerName: string;
  orderedAt: number;
  items: Items[];
};

export function handleReceivedOrder(socket: Socket, payload: ReceivedOrder) {
  const { orderId, customerName, orderedAt, items } = payload;

  if (!orderId) {
    console.error("Invalid order!");
    return;
  }

  //storing the info in the socket data itself
  socket.data.orderId = orderId;
  socket.data.customerName = customerName;
  socket.data.orderedAt = orderedAt;
  socket.data.items = items;
}

const orders = new Map<number, Order>();

const STATUS_MAP: Record<OrderStatus, true> = {
  Received: true,
  Preparing: true,
  Ready: true,
  Delivered: true,
  // NOTE: The value `true` is just a conventional placeholder meaning "exists"
};

function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && value in STATUS_MAP;
}

export function getOrder(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);

  if (!Number.isInteger(orderId)) {
    res.status(400).json({ message: "Invalid order ID." });
    return;
  }

  const order = orders.get(orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  res.json(order);
}

export function getAllOrders(req: Request, res: Response) {
  res.json([...orders.values()]);
}

export function updateOrderStatus(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);

  const { status } = req.body;

  if (!Number.isInteger(orderId)) {
    res.status(400).json({ message: "Invalid order ID." });
    return;
  }

  if (!isOrderStatus(status)) {
    res.status(400).json({ message: "Invalid status." });
    return;
  }

  const order = orders.get(orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  order.status = status;
  order.completedAt = Date.now();

  // notify all connected clients after the update succeeded
  req.app.get("io").emit("status_updated", [...orders.values()]);

  res.json(order);
}
