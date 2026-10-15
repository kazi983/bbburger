import type { Request, Response } from "express";
import { validateOrder, saveOrder } from "../models/orderModel";

//Place order: check the order, save it, and send back the result

export function placeOrder(req: Request, res: Response){
    try{
        // req.body is undefined when no JSON body is sent (Express 5)
        const result = validateOrder(req.body);

        if ("error" in result) {
            res.status(400).json({
                success: false,
                message: result.error,
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
    } catch(error){
        console.error("Error processing order:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process the order."
        });
    }
}