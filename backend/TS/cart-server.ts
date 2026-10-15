import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { validateOrder, saveOrder } from "./models/orderModel"

const app = express();
const PORT = process.env.PORT || 3000;


// Setting middleware
app.use(express.json());
app.use(cors());

// 1. Routing to check server is working
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Cart API Server is running!" });
});

// 2. The endpoint(POST) to accept 'Place Order'
app.post("/api/orders", (req: Request, res: Response) => {
    try {
        // req.body is undefined when no JSON body is sent (Express 5)
        const result = validateOrder(req.body);

        if (result.errors.length > 0) {
            res.status(400).json({
                success: false,
                message: result.errors[0],
                errors: result.errors,
            });
            return;
        }

        // Save the order in memory (this also gives it an order number)
        const order = saveOrder(result);

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
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process the order."
        });
    }
});

// 3. 404 handler for unknown routes (return JSON instead of HTML)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Not found"
    });
});

// 4. Error handler, e.g. invalid JSON body (return JSON instead of HTML)
app.use((err: { status?: number }, req: Request, res: Response, next: NextFunction) => {
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