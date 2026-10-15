"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderSockets = registerOrderSockets;
let currentOrderStatus = "Received";
function registerOrderSockets(io) {
    io.on("connection", (socket) => {
        console.log("client connected", socket.id);
        const request = socket.request;
        const userId = request.session?.userId;
        const isStaff = typeof userId === "number";
        if (isStaff) {
            socket.join("staff");
        }
        // Send current status to connected clients.
        socket.emit("actual_order_status", currentOrderStatus);
        // Only authenticated staff can update the order status.
        socket.on("updated_status", (newStatus) => {
            if (!isStaff) {
                return;
            }
            currentOrderStatus = newStatus;
            console.log(`Order status updated to: ${newStatus}`);
            // Customers still need status updates for tracking.
            io.emit("new_status", currentOrderStatus);
        });
        socket.on("disconnect", () => {
            console.log("client disconnected");
        });
    });
}
