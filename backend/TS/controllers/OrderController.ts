import type { Request, Response } from "express";
import type { OrderStatus } from "../../../shared/types";
import {
  validateOrder,
  saveOrder,
  findAllOrders,
  findOrderById,
  setOrderStatus,
} from "../models/orderModel";

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

//Place order: check the order, save it, and send back the result
export function placeOrder(req: Request, res: Response) {
  try {
    // req.body is undefined when no JSON body is sent (Express 5)
    const result = validateOrder(req.body);

    if ("error" in result) {
      res.status(400).json({
        success: false,
        message: result.error,
      });
      return;
    }

    // Save the order in memory (this also gives it an order number)
    const order = saveOrder(result);

    // notify staff after the update succeeded
    req.app.get("io").to("staff").emit("new_order", findAllOrders());

    // Succesfull response
    res.status(200).json({
      success: true,
      message: "Order placed successfully!",
      orderId: order.orderId,
      name: order.customerName,
      orderedAt: order.orderedAt,
      status: order.status,
      items: order.items,
      subtotal: result.subtotal,
      tax: result.tax,
      total: order.total,
    });
  } catch (error) {
    console.error("Error processing order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process the order.",
    });
  }
}

export function getOrder(req: Request, res: Response) {
  const orderId = Number(req.params.orderId);

  if (!Number.isInteger(orderId)) {
    res.status(400).json({ message: "Invalid order ID." });
    return;
  }

  const order = findOrderById(orderId);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  res.json(order);
}

export function getAllOrders(_req: Request, res: Response) {
  res.json(findAllOrders());
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

  const order = setOrderStatus(orderId, status);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  // notify staff after the update succeeded
  req.app.get("io").to("staff").emit("status_updated", findAllOrders());

  // notify the order status room after the update succeeded
  req.app
    .get("io")
    .to(`order:${order.orderId}`)
    .emit("order_status", order.status);

  res.json(order);
}
