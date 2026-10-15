"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const socket_io_1 = require("socket.io");
const http_1 = require("http");
const orderSocket_1 = require("./sockets/orderSocket");
const orders_1 = __importDefault(require("./routes/orders"));
const UserModel_1 = require("./models/UserModel");
dotenv_1.default.config();
const app = (0, express_1.default)();
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    console.error("SESSION_SECRET is not configured.");
    process.exit(1);
}
try {
    (0, UserModel_1.seedAdmin)();
}
catch (error) {
    console.error(error instanceof Error
        ? error.message
        : "Failed to seed admin account.");
    process.exit(1);
}
const sessionMiddleware = (0, cookie_session_1.default)({
    name: "session",
    keys: [sessionSecret],
    httpOnly: true,
    sameSite: "lax",
    secure: false,
});
app.use((0, cors_1.default)({
    origin: "http://localhost:4321",
    credentials: true,
}));
app.use(express_1.default.json());
app.use(sessionMiddleware);
app.use("/orders", orders_1.default);
const port = process.env.PORT || 3000;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:4321",
        credentials: true,
    },
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
});
