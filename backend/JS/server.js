"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
<<<<<<< HEAD
const orders_1 = __importDefault(require("./routes/orders"));
const app = (0, express_1.default)();
const PORT = 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Test route
app.get("/", (req, res) => {
    res.send("Food Ordering API is running!");
});
app.use("/orders", orders_1.default);
// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
=======
const dotenv_1 = __importDefault(require("dotenv"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const orderSocket_1 = require("./sockets/orderSocket");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: "http://localhost:4321", credentials: true }));
const port = process.env.POR || 3000;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "http://localhost:4321" },
});
(0, orderSocket_1.registerOrderSockets)(io);
server.listen(port, async () => {
    try {
        console.log(`app running on port ${port}`);
    }
    catch (err) {
        process.exit(1);
    }
});
process.on("SIGINT", async () => {
    console.log("shutting down gracefully...");
    process.exit(0);
>>>>>>> main
});
