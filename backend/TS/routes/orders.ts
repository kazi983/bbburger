import express from "express";
import {
  getAllOrders,
  getOrder,
  placeOrder,
  updateOrderStatus,
} from "../controllers/OrderController";

const router = express.Router();

//Place Order
router.post("/api/orders", placeOrder);

// Get all orders
router.get("/", getAllOrders);

// Get order by order id
router.get("/:orderId", getOrder);

// Update order status by order id
router.patch("/:orderId/status", updateOrderStatus);

export default router;
