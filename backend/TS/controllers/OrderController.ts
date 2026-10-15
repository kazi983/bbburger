import type { Server as IO, Socket } from "socket.io";

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
  orderedAt : number;
  items: Items[];
};

export function handleReceivedOrder(socket: Socket, payload: ReceivedOrder) {
  const { orderId, customerName, orderedAt , items } = payload;

  if (!orderId) {
    console.error("Invalid order!");
    return;
  }

  //storing the info in the socket data itself
  socket.data.orderId = orderId;
  socket.data.customerName = customerName;
  socket.data.orderedAt  = orderedAt ;
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