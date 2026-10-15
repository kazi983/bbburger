"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const OrderController_1 = require("../controllers/OrderController");
const router = express_1.default.Router();
//Place Order
router.post("/api/orders", OrderController_1.placeOrder);
// Get all orders
router.get("/", OrderController_1.getAllOrders);
// Get order by order id
router.get("/:orderId", OrderController_1.getOrder);
// Update order status by order id
router.patch("/:orderId/status", OrderController_1.updateOrderStatus);
exports.default = router;
