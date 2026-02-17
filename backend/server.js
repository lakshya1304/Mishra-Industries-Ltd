const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path"); // ADDED: Fixed the 'path is not defined' error

// 1. Load Environment Variables
dotenv.config();

// 2. Initialize Express
const app = express();

// 3. Global Middleware (MOVED UP: Must be before routes)
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

// 4. Static Folder for Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debugging
console.log("-----------------------------------------");
console.log("Connecting to:", process.env.MONGO_URI);
console.log("-----------------------------------------");

// 5. Database Connection Logic
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
    console.log("✅ Mishra Industries Database Connected Successfully"),
  )
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// 6. API Routes Integration
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// 7. Root Route for Testing
app.get("/", (req, res) => {
  res.send("Mishra Industries API is running...");
});

// 8. Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// 9. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
