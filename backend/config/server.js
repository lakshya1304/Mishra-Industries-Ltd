import express from "express";
import ejs from "ejs";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import morgan from "morgan";
import adminRoutes from "../routes/adminRoutes.js";
import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import queryRoutes from "../routes/queryRoutes.js";
import quotationRoutes from "../routes/quotationRoutes.js";
import { fileURLToPath } from "url";
import errorMiddleware from "../middleware/errorMiddleware.js";
// 1. Load Environment Variables (MUST BE FIRST)
// 2. Initialize Express
const app = express();
app.use(morgan("dev"));

// 3. Global Middleware
app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "https://mishra-industries-ltd.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Body Parser Middleware - Increased limits for Base64 image strings
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Robust Static Folder Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created missing 'uploads' directory.");
}
// Mapping the URL /uploads to the physical folder for manual assets
app.use("/uploads", express.static(uploadDir));

// 6. API Routes Integration

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/quotations", quotationRoutes);

// 7. Root Route for Testing
app.get("/", (req, res) => {
  res.send("Mishra Industries API is running correctly...");
});

// 8. Error Handling Middleware (Custom & Global)
app.use(errorMiddleware); // Uncomment and import if you have a custom error handler
// Final catch-all error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Optional but recommended: Use the specific custom error handler if preferred

export default app;
