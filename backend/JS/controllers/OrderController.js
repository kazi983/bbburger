"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReceivedOrder = handleReceivedOrder;
function handleReceivedOrder(socket, payload) {
    const { orderId, customerName, orderedAt, items } = payload;
    if (!orderId) {
        console.error("Invalid order!");
        return;
    }
    //storing the info in the socket data itself
    socket.data.orderId = orderId;
    socket.data.customerName = customerName;
    socket.data.orderedAt = orderedAt;
    socket.data.items = items;
}
