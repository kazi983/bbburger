"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderSockets = registerOrderSockets;
const OrderController_1 = require("../controllers/OrderController");
function registerOrderSockets(io) {
    io.on("connection", (socket) => {
        console.log("client connected", socket.id);
        socket.on("receive_order", (socket, payload) => OrderController_1.handleReceivedOrder);
        socket.on("disconnect", () => {
            console.log("client disconnected");
        });
    });
}
