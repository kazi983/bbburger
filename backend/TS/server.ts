import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { registerOrderSockets } from "./sockets/orderSocket";
import orderRoutes from "./routes/orders";
import { placeOrder } from "./controllers/CartController";


dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:4321", credentials: true }));
app.use(express.json());

app.use("/orders", orderRoutes);

//Place Order
app.post("/api/orders", placeOrder);

const port = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:4321" },
});

registerOrderSockets(io);

// 404 handler for unknown routes (return JSON instead of HTML)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        message: "Not found"
    });
});

// Error handler, e.g. invalid JSON body (return JSON instead of HTML)
app.use((err: { status?: number }, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    if (status >= 500) {
        console.error("Unexpected error:", err);
    }
    res.status(status).json({
        success: false,
        message: status === 400 ? "Invalid request body." : "Internal server error."
    });
});

server.listen(port, async () => {
  try {
    console.log(`app running on port ${port}`);
  } catch (err) {
    process.exit(1);
  }
});

process.on("SIGINT", async () => {
  console.log("shutting down gracefully...");
  process.exit(0);
});
