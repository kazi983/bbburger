"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
const TAX_RATE = 0.05; //tax rate in BC
const MAX_QUANTITY = 99;
const MAX_NAME_LENGTH = 50;
// Load the menu once at startup (server-side source of truth for prices)
const products = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../data/product.json"), "utf-8"));
const roundMoney = (value) => Math.round(value * 100) / 100;
// Validate the order body and recalculate prices from product.json.
// Returns a list of error messages, or the validated order.
function validateOrder(body) {
    const errors = [];
    const { customerName, items } = (body ?? {});
    // Customer name
    const name = typeof customerName === "string" ? customerName.trim() : "";
    if (!name) {
        errors.push("Customer name is required.");
    }
    else if (name.length > MAX_NAME_LENGTH) {
        errors.push(`Customer name must be ${MAX_NAME_LENGTH} characters or less.`);
    }
    // Cart items
    if (!Array.isArray(items) || items.length === 0) {
        errors.push("Cart is empty.");
        return { errors };
    }
    const lines = [];
    const seenIds = new Set();
    items.forEach((item, index) => {
        const { productId, quantity } = (item ?? {});
        const label = `Item ${index + 1}`;
        if (typeof productId !== "number" || !Number.isInteger(productId)) {
            errors.push(`${label}: productId must be an integer.`);
            return;
        }
        const product = products.find((p) => p.id === productId);
        if (!product) {
            errors.push(`${label}: product ${productId} does not exist.`);
            return;
        }
        if (seenIds.has(productId)) {
            errors.push(`${label}: product ${productId} is duplicated.`);
            return;
        }
        seenIds.add(productId);
        if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
            errors.push(`${label}: quantity must be an integer between 1 and ${MAX_QUANTITY}.`);
            return;
        }
        lines.push({
            productId,
            name: product.name,
            price: product.price,
            quantity,
            lineTotal: roundMoney(product.price * quantity),
        });
    });
    if (errors.length > 0) {
        return { errors };
    }
    // Never trust the total sent by the client; recalculate it here
    const subtotal = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal, 0));
    const tax = roundMoney(subtotal * TAX_RATE);
    const total = roundMoney(subtotal + tax);
    return { customerName: name, lines, subtotal, tax, total };
}
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
        const result = validateOrder(req.body);
        if ("errors" in result) {
            res.status(400).json({
                success: false,
                message: result.errors[0],
                errors: result.errors,
            });
            return;
        }
        // create order numbers randomly（Dummy）
        const orderId = `#FG-${Math.floor(1000 + Math.random() * 9000)}`;
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
