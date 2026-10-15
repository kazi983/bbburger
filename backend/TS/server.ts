import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import { Server } from "socket.io";
import { createServer } from "http";
import { registerOrderSockets } from "./sockets/orderSocket";
import orderRoutes from "./routes/orders";
import { seedAdmin } from "./models/UserModel";

dotenv.config();

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error("SESSION_SECRET is not configured.");
  process.exit(1);
}

try {
  seedAdmin();
} catch (error) {
  console.error(
    error instanceof Error
      ? error.message
      : "Failed to seed admin account.",
  );
  process.exit(1);
}

const sessionMiddleware = cookieSession({
  name: "session",
  keys: [sessionSecret],
  httpOnly: true,
  sameSite: "lax",
  secure: false,
});

app.use(
  cors({
    origin: "http://localhost:4321",
    credentials: true,
  }),
);

app.use(express.json());
app.use(sessionMiddleware);

app.use("/orders", orderRoutes);

const port = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:4321",
    credentials: true,
  },
});

registerOrderSockets(io);

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