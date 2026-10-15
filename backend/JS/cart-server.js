"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const orderModel_1 = require("./models/orderModel");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// Setting middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// 1. Routing to check server is working
app.get("/", (req, res) => {
    res.json({ message: "Cart API Server is running!" });
});
// 2. The endpoint(POST) to accept 'Place Order'
app.post("/api/orders", (req, res) => {
    try {
        // req.body is undefined when no JSON body is sent (Express 5)
        const result = (0, orderModel_1.validateOrder)(req.body);
        if (result.errors.length > 0) {
            res.status(400).json({
                success: false,
                message: result.errors[0],
                errors: result.errors,
            });
            return;
        }
        // create order numbers randomly（Dummy）
        const orderId = (0, orderModel_1.createOrderId)();
        console.log(`[Order Received] ID: ${orderId}, Customer: ${result.customerName}, Total: ${result.total}`);
        // Succesfull response
        res.status(200).json({
            success: true,
            message: "Order placed successfully!",
            orderId: orderId,
            name: result.customerName,
            items: result.lines,
            subtotal: result.subtotal,
            tax: result.tax,
            total: result.total,
        });
    }
    catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process the order."
        });
    }
});
// 3. 404 handler for unknown routes (return JSON instead of HTML)
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Not found"
    });
});
// 4. Error handler, e.g. invalid JSON body (return JSON instead of HTML)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    if (status >= 500) {
        console.error("Unexpected error:", err);
    }
    res.status(status).json({
        success: false,
        message: status === 400 ? "Invalid request body." : "Internal server error."
    });
});
// Work server
app.listen(PORT, () => {
    console.log(`Cart server is running on http://localhost:${PORT}`);
});
