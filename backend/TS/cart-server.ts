import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 4000;

// Setting middleware
app.use(express.json());
app.use(cors());

// 1. Routing to check server is working
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Cart API Server is running!" });
});

// 2. Get point to get the products data in the cart
app.get("/api/cart", (req: Request, res: Response) => {
    // Dummy products data in the cart
    const cartItems = [
        {
            id: "item-1",
            name: "Double Flame Cheeseburger",
            price: 8.99,
            quantity: 1,
            description: "Med-Well, Extra Pickles",
            tag: "Chef's Pick",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80"
        }
    ];

    res.status(200).json({
        success: true,
        items: cartItems,
        subtotal: 8.99,
        tax: 1.17,
        total: 10.16
    });
});

// 3. The endpoint(POST) to accept 'Place Order'
app.post("/api/orders", (req: Request, res: Response) => {
    try {
        // req.body is undefined when no JSON body is sent (Express 5)
        const { customerName, items, totalAmount } = req.body ?? {};

        // create order numbers randomly（Dummy）
        const orderId = `#FG-${Math.floor(1000 + Math.random() * 9000)}`;
        const name = customerName || "Alex Johnson";

        console.log(`[Order Received] ID: ${orderId}, Customer: ${name}, Total: ${totalAmount}`);

        // Succesfull response
        res.status(200).json({
            success: true,
            message: "Order placed successfully!",
            orderId: orderId,
            name: name,
        });
    } catch (error) {
        console.error("Error processing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process the order."
        });
    }
});

// 4. 404 handler for unknown routes (return JSON instead of HTML)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Not found"
    });
});

// 5. Error handler, e.g. invalid JSON body (return JSON instead of HTML)
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