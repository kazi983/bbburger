import express from "express";
import cors from "cors";
import orderRoutes from "./routes/orders";

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Food Ordering API is running!");
});

app.use("/orders", orderRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});