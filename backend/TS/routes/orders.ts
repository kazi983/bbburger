import express from "express";
import {
  getAllOrders,
  getOrder,
  placeOrder,
  updateOrderStatus,
} from "../controllers/OrderController";
import { requireAuth } from "../middleware/requireAuth";

const router = express.Router();

//Place Order
router.post("/api/orders", placeOrder);

// Get order by order id
router.get("/:orderId", getOrder);

// Get all orders
router.get("/", requireAuth, getAllOrders);

// Update order status by order id
router.patch("/:orderId/status", requireAuth, updateOrderStatus);

export default router;
