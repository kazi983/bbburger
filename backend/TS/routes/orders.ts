import express from "express";
import { getOrder } from "../controllers/OrderController";

const router = express.Router();

// Get order by order number
router.get("/:orderId", getOrder);

export default router;