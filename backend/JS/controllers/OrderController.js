"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleReceivedOrder = handleReceivedOrder;
exports.getOrder = getOrder;
exports.getAllOrders = getAllOrders;
exports.updateOrderStatus = updateOrderStatus;
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
    {
        orderId: 123,
        customerName: "Fernanda",
        status: "Received",
        orderedAt: new Date("2026/10/14 17:55").getTime(),
        total: 50,
        items: [
            {
                productId: 1,
                unitPrice: 1,
                productName: "Double Flame Burger",
                quantity: 2,
            },
            { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
            {
                productId: 1,
                unitPrice: 1,
                productName: "Strawberry Milkshake",
                quantity: 1,
            },
        ],
    },
    {
        orderId: 456,
        customerName: "Kazi",
        status: "Received",
        orderedAt: new Date("2026/10/14 18:00").getTime(),
        total: 50,
        items: [
            {
                productId: 1,
                unitPrice: 1,
                productName: "Double Flame Burger",
                quantity: 2,
            },
            { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
            {
                productId: 1,
                unitPrice: 1,
                productName: "Strawberry Milkshake",
                quantity: 1,
            },
        ],
    },
    {
        orderId: 888,
        customerName: "Kazi",
        status: "Received",
        orderedAt: Date.now(),
        total: 50,
        items: [
            {
                productId: 1,
                unitPrice: 1,
                productName: "Double Flame Burger",
                quantity: 2,
            },
            { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 3 },
            {
                productId: 1,
                unitPrice: 1,
                productName: "Strawberry Milkshake",
                quantity: 1,
            },
        ],
    },
    {
        orderId: 789,
        customerName: "Kazi",
        status: "Delivered",
        orderedAt: 2,
        completedAt: Date.now(),
        total: 50,
        items: [
            {
                productId: 1,
                unitPrice: 1,
                productName: "Cheese Flame Burger",
                quantity: 2,
            },
            { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 10 },
            {
                productId: 1,
                unitPrice: 1,
                productName: "Vanila Milkshake",
                quantity: 1,
            },
        ],
    },
    {
        orderId: 190,
        customerName: "Kazi",
        status: "Delivered",
        orderedAt: 2,
        completedAt: Date.now(),
        total: 50,
        items: [
            {
                productId: 1,
                unitPrice: 1,
                productName: "Cheese Flame Burger",
                quantity: 2,
            },
            { productId: 1, unitPrice: 1, productName: "Mega Fries", quantity: 10 },
            {
                productId: 1,
                unitPrice: 1,
                productName: "Vanila Milkshake",
                quantity: 1,
            },
        ],
    },
];
const orders = new Map(mockOrders.map((order) => [order.orderId, order]));
const STATUS_MAP = {
    Received: true,
    Preparing: true,
    Ready: true,
    Delivered: true,
    // NOTE: The value `true` is just a conventional placeholder meaning "exists"
};
function isOrderStatus(value) {
    return typeof value === "string" && value in STATUS_MAP;
}
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
function getAllOrders(req, res) {
    res.json([...orders.values()]);
}
function updateOrderStatus(req, res) {
    const orderId = Number(req.params.orderId);
    const { status } = req.body;
    if (!Number.isInteger(orderId)) {
        res.status(400).json({ message: "Invalid order ID." });
        return;
    }
    if (!isOrderStatus(status)) {
        res.status(400).json({ message: "Invalid status." });
        return;
    }
    const order = orders.get(orderId);
    if (!order) {
        res.status(404).json({ message: "Order not found." });
        return;
    }
    order.status = status;
    // notify all connected clients after the update succeeded
    req.app.get("io").emit("status_updated", [...orders.values()]);
    res.json(order);
}
