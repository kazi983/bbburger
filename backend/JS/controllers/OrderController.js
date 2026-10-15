"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReceivedOrder = handleReceivedOrder;
exports.getOrder = getOrder;
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
// get order function --temp mock
const mockOrders = [
    {
        orderId: 1001,
        customerName: "Test Customer",
        orderedAt: Date.now(),
        status: "Received",
        items: [
            {
                productId: 1,
                productName: "Classic Burger",
                unitPrice: 12,
                quantity: 1,
            },
        ],
        total: 12,
    },
];
const orders = new Map(mockOrders.map((order) => [order.orderId, order]));
function getOrder(req, res) {
    const orderId = Number(req.params.orderId);
    if (!Number.isInteger(orderId)) {
        res.status(400).json({ message: "Invalid order ID." });
        return;
    }
    const order = orders.get(orderId);
    if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
    }
    res.json(order);
}
