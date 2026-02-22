const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("node:path");
const fs = require("node:fs");
const morgan = require("morgan");
let db = require("./config/db.js");

// 1. Load Environment Variables (MUST BE FIRST)
dotenv.config();

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
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created missing 'uploads' directory.");
}
// Mapping the URL /uploads to the physical folder for manual assets
app.use("/uploads", express.static(uploadDir));

// Debugging Log
console.log("-----------------------------------------");
console.log(
  "Connecting to Atlas Cluster:",
  process.env.NODE_ENV === "dev" ? "Local Development" : "Production Node",
);
console.log("-----------------------------------------");

// 5. Database Connection Logic (Atlas Connected)
db();

// 6. API Routes Integration
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// 7. Root Route for Testing
app.get("/", (req, res) => {
  res.send("Mishra Industries API is running correctly...");
});

// 8. Error Handling Middleware (Custom & Global)
const { errorHandler } = require("./middleware/errorMiddleware");

// Final catch-all error handling
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// Optional but recommended: Use the specific custom error handler if preferred
app.use(errorHandler);

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server fired up on ${PORT}`);
});
