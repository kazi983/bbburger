import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";
import { registerOrderSockets } from "./sockets/orderSocket";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:4321", credentials: true }));

const port = process.env.POR || 3000;

const server = createServer(app);

const io = new Server(server, {
  cors: { origin: "http://localhost:4321" },
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
