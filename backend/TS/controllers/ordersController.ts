import { Request, Response } from "express";
import orders from "../../data/orders.json";

// Get an order by order number
export function getOrder(req: Request, res: Response) {
  const orderNum = Number(req.params.orderNum);

  const order = orders.find((item) => item.orderNum === orderNum);

  if (!order) {
    res.status(404).json({ message: "Order not found." });
    return;
  }

  res.json(order);
}