import type { Socket } from "socket.io";

import type { Request, Response } from "express";
import type { Order } from "../../../shared/types";

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

// get order function --temp mock
const mockOrders: Order[] = [
  {
    orderId: 1001,
    customerName: "Test Customer",
    orderedAt: Date.now(),
    status: "Received",
    items: [
      {
        productId: 1,
        productName: "Classic Burger",
        unitPrice: 12,
        quantity: 1,
      },
    ],
    total: 12,
  },
  {
    orderId: 123,
    customerName: "Fernanda",
    status: "Received",
    orderedAt: new Date("2026/10/14 17:55").getTime(),
    total: 50,
    items: [
      {
        productId: 1,
        unitPrice: 1,
        productName: "Double Flame Burger",
        quantity: 2,
      },
      { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
      {
        productId: 1,
        unitPrice: 1,
        productName: "Strawberry Milkshake",
        quantity: 1,
      },
    ],
  },
  {
    orderId: 456,
    customerName: "Kazi",
    status: "Received",
    orderedAt: new Date("2026/10/14 18:00").getTime(),
    total: 50,
    items: [
      {
        productId: 1,
        unitPrice: 1,
        productName: "Double Flame Burger",
        quantity: 2,
      },
      { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
      {
        productId: 1,
        unitPrice: 1,
        productName: "Strawberry Milkshake",
        quantity: 1,
      },
    ],
  },
  {
    orderId: 888,
    customerName: "Kazi",
    status: "Received",
    orderedAt: Date.now(),
    total: 50,
    items: [
      {
        productId: 1,
        unitPrice: 1,
        productName: "Double Flame Burger",
        quantity: 2,
      },
      { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
      {
        productId: 1,
        unitPrice: 1,
        productName: "Strawberry Milkshake",
        quantity: 1,
      },
    ],
  },
  {
    orderId: 789,
    customerName: "Kazi",
    status: "Delivered",
    orderedAt: 2,
    completedAt: Date.now(),
    total: 50,
    items: [
      {
        productId: 1,
        unitPrice: 1,
        productName: "Cheese Flame Burger",
        quantity: 2,
      },
      { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 10 },
      {
        productId: 1,
        unitPrice: 1,
        productName: "Vanila Milkshake",
        quantity: 1,
      },
    ],
  },
  {
    orderId: 190,
    customerName: "Kazi",
    status: "Delivered",
    orderedAt: 2,
    completedAt: Date.now(),
    total: 50,
    items: [
      {
        productId: 1,
        unitPrice: 1,
        productName: "Cheese Flame Burger",
        quantity: 2,
      },
      { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 10 },
      {
        productId: 1,
        unitPrice: 1,
        productName: "Vanila Milkshake",
        quantity: 1,
      },
    ],
  },
];

const orders = new Map<number, Order>(
  mockOrders.map((order) => [order.orderId, order] as const),
);

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

  const order = orders.get(orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  order.status = status;

  // notify all connected clients after the update succeeded
  req.app.get("io").emit("status_updated", [...orders.values()]);

  res.json(order);
}
