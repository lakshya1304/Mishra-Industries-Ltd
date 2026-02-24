#!/usr/bin/env node
/**
 * Configuration & Database Connection Tester
 * Verifies all config, environment variables, and database connections
 * Run from backend/: node tests/test_config.js
 */

import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Color codes
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  bold: "\x1b[1m",
};

let results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

function log(level, message) {
  let prefix = "";
  switch (level) {
    case "success":
      prefix = `${colors.green}✓${colors.reset}`;
      results.passed++;
      break;
    case "error":
      prefix = `${colors.red}✗${colors.reset}`;
      results.failed++;
      break;
    case "warning":
      prefix = `${colors.yellow}⚠${colors.reset}`;
      results.warnings++;
      break;
    case "info":
      prefix = `${colors.blue}ℹ${colors.reset}`;
      break;
    case "header":
      console.log(`\n${colors.bold}${colors.blue}${message}${colors.reset}`);
      return;
  }
  console.log(`${prefix} ${message}`);
}

async function testConfig() {
  console.clear();
  console.log(
    `${colors.bold}${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`,
  );
  console.log(
    `${colors.bold}${colors.blue}║   BACKEND CONFIGURATION & DATABASE TESTER   ║${colors.reset}`,
  );
  console.log(
    `${colors.bold}${colors.blue}╚════════════════════════════════════════════╝${colors.reset}\n`,
  );

  // ============= 1. ENVIRONMENT VARIABLES =============
  log("header", "1️⃣  ENVIRONMENT VARIABLES CHECK");
  console.log("─".repeat(50));

  const requiredEnvVars = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD",
    "NODE_ENV",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
  ];

  requiredEnvVars.forEach((envVar) => {
    if (process.env[envVar]) {
      const value =
        envVar.includes("PASSWORD") || envVar.includes("SECRET") ?
          "***" + process.env[envVar].slice(-4)
        : envVar === "MONGO_URI" ?
          process.env[envVar].split("@")[0] +
          "@***.mongodb.net/" +
          process.env[envVar].split("/").slice(-1)[0]
        : process.env[envVar];
      log("success", `${envVar} = ${value}`);
    } else {
      log("error", `${envVar} is missing`);
    }
  });

  // ============= 2. FILE STRUCTURE CHECK =============
  log("header", "2️⃣  FILE STRUCTURE CHECK");
  console.log("─".repeat(50));

  const requiredFiles = [
    { path: "./config/db.js", name: "Database Config" },
    { path: "./config/server.js", name: "Server Config" },
    { path: "./middleware/authMiddleware.js", name: "Auth Middleware" },
    { path: "./middleware/errorMiddleware.js", name: "Error Middleware" },
    { path: "./models/User.js", name: "User Model" },
    { path: "./models/Product.js", name: "Product Model" },
    { path: "./models/Order.js", name: "Order Model" },
    { path: "./models/Query.js", name: "Query Model" },
    { path: "./routes/authRoutes.js", name: "Auth Routes" },
    { path: "./routes/productRoutes.js", name: "Product Routes" },
    { path: "./routes/orderRoutes.js", name: "Order Routes" },
    { path: "./routes/queryRoutes.js", name: "Query Routes" },
    { path: "./routes/adminRoutes.js", name: "Admin Routes" },
    { path: "./controllers/authController.js", name: "Auth Controller" },
    { path: "./controllers/productController.js", name: "Product Controller" },
  ];

  requiredFiles.forEach((file) => {
    if (fs.existsSync(file.path)) {
      const stats = fs.statSync(file.path);
      log("success", `${file.name.padEnd(25)} (${stats.size} bytes)`);
    } else {
      log("error", `${file.name.padEnd(25)} (MISSING)`);
    }
  });

  // ============= 3. DATABASE CONNECTION TEST =============
  log("header", "3️⃣  DATABASE CONNECTION TEST");
  console.log("─".repeat(50));

  if (!process.env.MONGO_URI) {
    log("error", "MONGO_URI not defined in .env");
    logResults();
    return;
  }

  try {
    log("info", "Connecting to MongoDB...");
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 60000,
      family: 4,
      retryWrites: true,
    });

    log("success", `Connected to: ${conn.connection.host}`);
    log("success", `Database: ${conn.connection.name}`);
    log(
      "success",
      `Connection State: Ready (${mongoose.connection.readyState})`,
    );

    // ============= 4. MODELS TEST =============
    log("header", "4️⃣  MODELS REGISTRATION CHECK");
    console.log("─".repeat(50));

    const models = ["User", "Product", "Order", "Query", "Admin"];
    for (const modelName of models) {
      try {
        const model = mongoose.model(modelName);
        const count = await model.countDocuments();
        log("success", `${modelName.padEnd(15)} (${count} documents)`);
      } catch (err) {
        log("error", `${modelName.padEnd(15)} (${err.message})`);
      }
    }

    // ============= 5. COLLECTIONS TEST =============
    log("header", "5️⃣  COLLECTIONS VERIFICATION");
    console.log("─".repeat(50));

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    if (collections.length > 0) {
      log("success", `Found ${collections.length} collections:`);
      collections.forEach((col) => {
        console.log(`   └─ ${col.name}`);
      });
    } else {
      log("warning", "No collections found in database");
    }

    // ============= 6. INDEXES TEST =============
    log("header", "6️⃣  DATABASE INDEXES CHECK");
    console.log("─".repeat(50));

    try {
      const User = mongoose.model("User");
      const indexes = await User.collection.getIndexes();
      log("success", `User model indexes: ${Object.keys(indexes).length}`);
      Object.keys(indexes).forEach((idx) => {
        console.log(`   └─ ${idx}`);
      });
    } catch (err) {
      log("warning", `Could not fetch indexes: ${err.message}`);
    }

    // ============= 7. QUERY PERFORMANCE TEST =============
    log("header", "7️⃣  QUERY PERFORMANCE TEST");
    console.log("─".repeat(50));

    try {
      // Test simple query
      const start = Date.now();
      const User = mongoose.model("User");
      const count = await User.countDocuments();
      const duration = Date.now() - start;
      log(
        "success",
        `User.countDocuments() completed in ${duration}ms (${count} users)`,
      );

      if (duration > 1000) {
        log("warning", "Query took longer than 1 second - consider optimizing");
      }
    } catch (err) {
      log("error", `Query performance test failed: ${err.message}`);
    }

    // ============= 8. MIDDLEWARE IMPORTS TEST =============
    log("header", "8️⃣  MIDDLEWARE IMPORTS TEST");
    console.log("─".repeat(50));

    try {
      const { protect } = await import("../middleware/authMiddleware.js");
      log("success", "Auth Middleware imported successfully");
    } catch (err) {
      log("error", `Failed to import auth middleware: ${err.message}`);
    }

    try {
      const { errorHandler } = await import("../middleware/errorMiddleware.js");
      log("success", "Error Middleware imported successfully");
    } catch (err) {
      log("error", `Failed to import error middleware: ${err.message}`);
    }

    // ============= 9. ROUTES IMPORTS TEST =============
    log("header", "9️⃣  ROUTES IMPORTS TEST");
    console.log("─".repeat(50));

    const routes = [
      { path: "../routes/authRoutes.js", name: "Auth Routes" },
      { path: "../routes/productRoutes.js", name: "Product Routes" },
      { path: "../routes/orderRoutes.js", name: "Order Routes" },
      { path: "../routes/queryRoutes.js", name: "Query Routes" },
      { path: "../routes/adminRoutes.js", name: "Admin Routes" },
    ];

    for (const route of routes) {
      try {
        await import(route.path);
        log("success", `${route.name} imported successfully`);
      } catch (err) {
        log("error", `Failed to import ${route.name}: ${err.message}`);
      }
    }

    // ============= 10. UTILS IMPORTS TEST =============
    log("header", "1️⃣0️⃣  UTILS IMPORTS TEST");
    console.log("─".repeat(50));

    const utils = [
      { path: "../utils/asyncHandler.js", name: "asyncHandler" },
      { path: "../utils/error.js", name: "error handler" },
      { path: "../utils/success.js", name: "success handler" },
      { path: "../utils/token.js", name: "token utility" },
      { path: "../utils/sendEmail.js", name: "email sender" },
    ];

    for (const util of utils) {
      try {
        await import(util.path);
        log("success", `${util.name} imported successfully`);
      } catch (err) {
        log("error", `Failed to import ${util.name}: ${err.message}`);
      }
    }

    // Cleanup
    await mongoose.disconnect();
    log("info", "Database connection closed");
  } catch (error) {
    log("error", `Database connection failed: ${error.message}`);
    log(
      "warning",
      "Make sure MongoDB Atlas is accessible and credentials are correct",
    );
  }

  logResults();
}

function logResults() {
  console.log(`\n${"═".repeat(50)}`);
  console.log(`${colors.bold}📊 TEST RESULTS SUMMARY${colors.reset}`);
  console.log(`${"═".repeat(50)}\n`);

  const total = results.passed + results.failed + results.warnings;
  console.log(`Total Tests: ${colors.bold}${total}${colors.reset}`);
  console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);

  if (results.failed === 0) {
    console.log(
      `\n${colors.green}${colors.bold}✓ Configuration is valid! Ready for deployment.${colors.reset}`,
    );
    process.exit(0);
  } else {
    console.log(
      `\n${colors.red}${colors.bold}✗ Configuration has issues. Review errors above.${colors.reset}`,
    );
    process.exit(1);
  }
}

testConfig().catch((err) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err.message);
  process.exit(1);
});
