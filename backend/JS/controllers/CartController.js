"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.placeOrder = placeOrder;
const orderModel_1 = require("../models/orderModel");
//Place order: check the order, save it, and send back the result
function placeOrder(req, res) {
    try {
        // req.body is undefined when no JSON body is sent (Express 5)
        const result = (0, orderModel_1.validateOrder)(req.body);
        if ("error" in result) {
            res.status(400).json({
                success: false,
                message: result.error,
            });
            return;
        }
        // Save the order in memory (this also gives it an order number)
        const order = (0, orderModel_1.saveOrder)(result);
        console.log(`[Order Received] ID: ${order.orderId}, Customer: ${order.customerName}, Total: ${order.total}`);
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
    }
    catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process the order."
        });
    }
}
