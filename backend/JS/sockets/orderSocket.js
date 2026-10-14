"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderSockets = registerOrderSockets;
let currentOrderStatus = "Received";
function registerOrderSockets(io) {
    io.on("connection", (socket) => {
        console.log("client connected", socket.id);
        // send actual status
        socket.emit("actual_order_status", currentOrderStatus);
        // dashboard send new status
        socket.on("updated_status", (newStatus) => {
            currentOrderStatus = newStatus;
            console.log(`Order status updated to: ${newStatus}`);
            // send new status to everyone
            io.emit("new_status", currentOrderStatus);
        });
        socket.on("disconnect", () => {
            console.log("client disconnected");
        });
    });
}
