import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import morgan from "morgan";
import adminRoutes from "../routes/adminRoutes.js";
import mongoose from "mongoose";
import authRoutes from "../routes/authRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import queryRoutes from "../routes/queryRoutes.js";
import quotationRoutes from "../routes/quotationRoutes.js";
import { fileURLToPath } from "url";
import { errorHandler } from "../middleware/errorMiddleware.js";
import debugStore from "../utils/debugStore.js";
// 1. Load Environment Variables (MUST BE FIRST)
// 2. Initialize Express
const app = express();
app.use(morgan("dev"));

// 3. Global Middleware
// CORS: allow local file:// requests (origin 'null') during development and
// permit configured origins otherwise.
const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://mishra-industries-ltd.vercel.app",
];
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow no-origin requests (file://) in dev mode
      if (!origin && process.env.MODE === "dev") return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS policy: origin not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Body Parser Middleware - Increased limits for Base64 image strings
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Simple in-memory response cache used as a fallback when DB is down.
// Caches successful GET responses (status 200) for a short TTL.
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware: capture successful GET responses to populate cache when DB is healthy
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  const originalSend = res.send.bind(res);

  res.json = function (body) {
    try {
      if (
        req.method === "GET" &&
        mongoose.connection.readyState === 1 &&
        res.statusCode === 200
      ) {
        responseCache.set(req.originalUrl, { body, ts: Date.now() });
      }
    } catch (e) {
      // ignore cache errors
    }
    return originalJson(body);
  };

  res.send = function (body) {
    try {
      if (
        req.method === "GET" &&
        mongoose.connection.readyState === 1 &&
        res.statusCode === 200
      ) {
        let parsed = body;
        try {
          parsed = JSON.parse(body);
        } catch (err) {
          // body is not JSON
        }
        responseCache.set(req.originalUrl, { body: parsed, ts: Date.now() });
      }
    } catch (e) {
      // ignore cache errors
    }
    return originalSend(body);
  };

  next();
});

// Middleware: when DB disconnected, attempt to serve cached GET responses
app.use((req, res, next) => {
  if (req.method !== "GET") return next();
  const dbConnected =
    mongoose.connection && mongoose.connection.readyState === 1;
  if (dbConnected) return next();

  const key = req.originalUrl;
  const entry = responseCache.get(key);
  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    res.set("X-Cache", "HIT");
    return res.status(200).json(entry.body);
  }

  res.set("X-Cache", "MISS");
  return res
    .status(503)
    .json({ message: "Service degraded - DB unavailable", cached: false });
});

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

// Debug routes (development only)
app.get("/__debug/env", (req, res) => {
  if (process.env.MODE !== "dev" && process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "disabled" });
  }
  const maskedMongo = (() => {
    const m = process.env.MONGO_URI || "";
    if (!m) return null;
    return m.replace(/:\/\/.*@/, "://***@");
  })();
  return res.json({
    NODE_ENV: process.env.NODE_ENV,
    MODE: process.env.MODE,
    PORT: process.env.PORT,
    MONGO_URI: maskedMongo,
  });
});

app.get("/__debug/otp", (req, res) => {
  if (process.env.MODE !== "dev" && process.env.NODE_ENV === "production") {
    return res.status(403).json({ message: "disabled" });
  }
  const email = req.query.email;
  if (!email) return res.status(400).json({ message: "email required" });
  const otp = debugStore.getOTP(email);
  if (!otp) return res.status(404).json({ message: "otp not found" });
  return res.json({ otp });
});

// Middleware: wait for DB to be ready for non-cacheable requests.
// This waits up to DB_WAIT_TIMEOUT_MS (default 5000ms) for mongoose to connect.
const ensureDbConnected = async (req, res, next) => {
  const timeout = Number(process.env.DB_WAIT_TIMEOUT_MS) || 5000;
  if (mongoose.connection && mongoose.connection.readyState === 1)
    return next();
  const start = Date.now();
  const poll = (ms) => new Promise((r) => setTimeout(r, ms));
  while (Date.now() - start < timeout) {
    if (mongoose.connection && mongoose.connection.readyState === 1)
      return next();
    // small sleep to avoid busy loop
    // eslint-disable-next-line no-await-in-loop
    await poll(100);
  }
  return res
    .status(503)
    .json({ message: "Database unavailable, try again later" });
};

// Apply DB-wait middleware to all /api routes so endpoints like login wait
// briefly for the DB (instead of failing immediately) while keeping the
// server non-blocking at startup.
app.use("/api", ensureDbConnected);

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

// Health check endpoint
// Reports application status and database connection state.
app.get("/health", (req, res) => {
  const states = [
    "disconnected",
    "connected",
    "connecting",
    "disconnecting",
    "uninitialized",
  ];
  const dbState =
    mongoose.connection && typeof mongoose.connection.readyState === "number" ?
      states[mongoose.connection.readyState] || "unknown"
    : "unknown";

  const healthy = dbState === "connected";
  const payload = {
    status: healthy ? "ok" : "degraded",
    database: {
      state: dbState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    },
    uptime: process.uptime(),
  };

  return res.status(healthy ? 200 : 503).json(payload);
});

// 8. Error Handling Middleware (Custom & Global)
app.use(errorHandler); // Use the actual error handler function
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
