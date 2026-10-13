"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerOrderSockets = registerOrderSockets;
function registerOrderSockets(io) {
    io.on("connection", (socket) => {
        console.log("client connected", socket.id);
        socket.on("disconnect", () => {
            console.log("client disconnected");
        });
    });
}
