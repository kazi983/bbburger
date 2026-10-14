"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrder = getOrder;
const orders_json_1 = __importDefault(require("../../data/orders.json"));
// Get an order by order number
function getOrder(req, res) {
    const orderNum = Number(req.params.orderNum);
    const order = orders_json_1.default.find((item) => item.orderNum === orderNum);
    if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
    }
    res.json(order);
}
