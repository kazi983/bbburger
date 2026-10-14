import express from "express";
import { getOrder } from "../controllers/ordersController";

const router = express.Router();

// Get order by order number
router.get("/:orderNum", getOrder);

export default router;