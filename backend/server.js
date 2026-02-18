const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
let db = require("./config/db.js");
const path = require("path");
let morgan=require("morgan")
// 1. Load Environment Variables (MUST BE FIRST)
dotenv.config();

// 2. Initialize Express
const app = express();
app.use(morgan("dev"))
// 3. Global Middleware
app.use(
  cors({
    // Add your Vercel URL and local testing URL here
    origin: ["http://127.0.0.1:5500", "https://mishra-industries-ltd.vercel.app"], 
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Recommended if you plan to use cookies or login sessions
  }),
);
app.use(express.json());

// 4. Static Folder for Images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// process.env.NODE_ENV="prod"
// Debugging
console.log("-----------------------------------------");
console.log(
  "Connecting to:",
  process.env.NODE_ENV == "dev" ? process.env.MONGO_URI : "some db",
);
console.log("-----------------------------------------");

// 5. Database Connection Logic (Cleaned for Atlas)
db();

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

let PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server fired up on ${PORT}`);
});


//envf, status-map:cjs-ejs'''