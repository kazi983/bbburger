import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieSession from "cookie-session";
import { Server } from "socket.io";
import { createServer } from "http";
import { registerOrderSockets } from "./sockets/orderSocket";
import orderRoutes from "./routes/orders";

import authRoutes from "./routes/authRoutes";
import { seedAdmin } from "./models/UserModel";

dotenv.config();

const app = express();

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  console.error("SESSION_SECRET is not configured.");
  process.exit(1);
}

const frontendUrl = process.env.FRONTEND_URL;

if (!frontendUrl) {
  console.error("FRONTEND_URL is not configured.");
  process.exit(1);
}

try {
  seedAdmin();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Failed to seed admin account.",
  );
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";

const sessionMiddleware = cookieSession({
  name: "session",
  keys: [sessionSecret],
  httpOnly: true,

  // When running in production, allow cross-site requests (`sameSite: none`, which requires `secure: true`);
  // otherwise, use the browser's default (`sameSite: lax`).
  sameSite: isProduction ? "none" : "lax",
  // `secure: true` encures cookies are sent only over HTTPS.
  secure: isProduction,
});

// Trusts exactly one reverse proxy immediately in front of the app. (trust proxy: 1)
if (isProduction) app.set("trust proxy", 1);

app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);

app.use(express.json());
app.use(sessionMiddleware);

app.use("/api/auth", authRoutes);
app.use("/orders", orderRoutes);

const port = process.env.PORT || 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: frontendUrl,
    credentials: true,
  },
});

io.engine.use(sessionMiddleware);

app.set("io", io);

registerOrderSockets(io);

// 404 handler for unknown routes (return JSON instead of HTML)
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Not found",
  });
});

// Error handler, e.g. invalid JSON body (return JSON instead of HTML)
app.use(
  (
    err: { status?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    const status = err.status || 500;
    if (status >= 500) {
      console.error("Unexpected error:", err);
    }
    res.status(status).json({
      success: false,
      message:
        status === 400 ? "Invalid request body." : "Internal server error.",
    });
  },
);

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
