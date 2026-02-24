#!/usr/bin/env node
/**
 * Comprehensive API Testing Suite
 * Tests all endpoints with database connectivity verification
 * Run from backend/: node tests/test_api_comprehensive.js
 */

import db from "../config/db.js";
import mongoose from "mongoose";
import "dotenv/config";

const BASE = process.env.BASE || "http://localhost:5000";
let testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

// ===================== HELPERS =====================
function logTest(name, success, details = "") {
  const status = success ? "✓ PASS" : "✗ FAIL";
  console.log(`${status} | ${name}`);
  if (details) console.log(`      ${details}`);
  testResults.tests.push({ name, success, details });
  if (success) testResults.passed++;
  else testResults.failed++;
}

async function testFetch(method, endpoint, body = null, headers = {}) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json", ...headers },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE}${endpoint}`, options);
    const text = await res.text();
    let data = {};
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { raw: text };
    }
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    return { ok: false, status: 0, data: { error: error.message } };
  }
}

function rand() {
  return Date.now().toString().slice(-6);
}

// ===================== TESTS =====================

async function runTests() {
  console.log("\n" + "=".repeat(60));
  console.log("🧪 COMPREHENSIVE API TEST SUITE");
  console.log("=".repeat(60));

  // 1. DATABASE CONNECTION TEST
  console.log("\n📦 [1/7] DATABASE CONNECTION TEST");
  console.log("-".repeat(60));
  try {
    await db();
    logTest(
      "Database Connection",
      true,
      `Connected to: ${mongoose.connection.host}/${mongoose.connection.name}`,
    );
    logTest(
      "MongoDB Status",
      mongoose.connection.readyState === 1,
      `Ready state: ${mongoose.connection.readyState}`,
    );
  } catch (error) {
    logTest("Database Connection", false, error.message);
    console.error("❌ Database connection failed. Exiting.");
    process.exit(1);
  }

  // 2. AUTH ENDPOINTS TEST
  console.log("\n🔐 [2/7] AUTH ENDPOINTS TEST");
  console.log("-".repeat(60));

  const testEmail = `test+${rand()}@example.com`;
  const testPassword = "TestPass@123";
  const testPhone = `9${rand()}${rand().padStart(7, "0")}`;
  let authToken = null;

  // Register
  const regRes = await testFetch("POST", "/api/auth/register", {
    fullName: "Test User",
    email: testEmail,
    phone: testPhone,
    password: testPassword,
    accountType: "customer",
  });
  logTest(
    "User Registration",
    regRes.ok,
    `Email: ${testEmail}, Status: ${regRes.status}`,
  );

  // Login
  const loginRes = await testFetch("POST", "/api/auth/login", {
    email: testEmail,
    password: testPassword,
    accountType: "customer",
  });
  logTest("User Login", loginRes.ok, `Status: ${loginRes.status}`);
  if (loginRes.ok && loginRes.data.token) {
    authToken = loginRes.data.token;
    logTest("Token Generation", true, `Token length: ${authToken.length}`);
  } else {
    logTest("Token Generation", false, `No token in response`);
  }

  // Get Profile
  if (authToken) {
    const profileRes = await testFetch("GET", "/api/auth/profile", null, {
      Authorization: `Bearer ${authToken}`,
    });
    logTest("Get User Profile", profileRes.ok, `Status: ${profileRes.status}`);
  }

  // 3. PRODUCT ENDPOINTS TEST
  console.log("\n📦 [3/7] PRODUCT ENDPOINTS TEST");
  console.log("-".repeat(60));

  const productData = {
    name: `Test Product ${rand()}`,
    description: "A test product for integration testing",
    category: "Electronics",
    company: "Test Company",
    price: 9999,
    discount: 10,
    stock: 50,
    image: "/images/logo.jpeg",
  };

  let productId = null;

  // Add Product
  const addProdRes = await testFetch("POST", "/api/products/add", productData);
  logTest("Add Product", addProdRes.ok, `Status: ${addProdRes.status}`);
  if (addProdRes.ok && addProdRes.data._id) {
    productId = addProdRes.data._id;
  }

  // Get All Products
  const allProdRes = await testFetch("GET", "/api/products/all");
  logTest(
    "Get All Products",
    allProdRes.ok,
    `Status: ${allProdRes.status}, Count: ${Array.isArray(allProdRes.data) ? allProdRes.data.length : 0}`,
  );

  // Get Product By ID
  if (productId) {
    const getProdRes = await testFetch("GET", `/api/products/get/${productId}`);
    logTest("Get Product By ID", getProdRes.ok, `Status: ${getProdRes.status}`);
  }

  // 4. ORDER ENDPOINTS TEST
  console.log("\n📋 [4/7] ORDER ENDPOINTS TEST");
  console.log("-".repeat(60));

  if (authToken) {
    const orderData = {
      customerName: "Test Customer",
      phone: testPhone,
      address: "123 Test Street, Test City",
      items: [
        {
          productId: productId || "123",
          quantity: 2,
          price: 9999,
        },
      ],
      totalAmount: 19998,
      gstAmount: 3599.64,
      paymentMethod: "Online",
      status: "Pending",
    };

    // Add Order
    const addOrderRes = await testFetch("POST", "/api/orders/add", orderData, {
      Authorization: `Bearer ${authToken}`,
    });
    logTest("Create Order", addOrderRes.ok, `Status: ${addOrderRes.status}`);

    // Get User Orders
    const userOrdersRes = await testFetch(
      "GET",
      "/api/orders/my-orders",
      null,
      {
        Authorization: `Bearer ${authToken}`,
      },
    );
    logTest(
      "Get User Orders",
      userOrdersRes.ok,
      `Status: ${userOrdersRes.status}`,
    );
  }

  // 5. QUERY ENDPOINTS TEST
  console.log("\n💬 [5/7] QUERY ENDPOINTS TEST");
  console.log("-".repeat(60));

  const queryData = {
    name: "Test Query",
    email: `query+${rand()}@example.com`,
    message: "This is a test query from the test suite",
  };

  // Add Query
  const addQueryRes = await testFetch("POST", "/api/queries/add", queryData);
  logTest("Submit Query", addQueryRes.ok, `Status: ${addQueryRes.status}`);

  // Get All Queries
  const allQueriesRes = await testFetch("GET", "/api/queries/all");
  logTest(
    "Get All Queries",
    allQueriesRes.ok,
    `Status: ${allQueriesRes.status}, Count: ${Array.isArray(allQueriesRes.data) ? allQueriesRes.data.length : 0}`,
  );

  // 6. ADMIN ENDPOINTS TEST
  console.log("\n👨‍💼 [6/7] ADMIN ENDPOINTS TEST");
  console.log("-".repeat(60));

  const adminLoginRes = await testFetch("POST", "/api/admin/login", {
    email: "admin@mishra.com",
    password: "Admin@123",
  });
  logTest("Admin Login", adminLoginRes.ok, `Status: ${adminLoginRes.status}`);

  // 7. DATABASE OPERATIONS TEST
  console.log("\n🗄️ [7/7] DATABASE OPERATIONS TEST");
  console.log("-".repeat(60));

  try {
    const User = mongoose.model("User");
    const userCount = await User.countDocuments();
    logTest("Count Users in DB", true, `Total users: ${userCount}`);

    const Product = mongoose.model("Product");
    const productCount = await Product.countDocuments();
    logTest("Count Products in DB", true, `Total products: ${productCount}`);

    const Query = mongoose.model("Query");
    const queryCount = await Query.countDocuments();
    logTest("Count Queries in DB", true, `Total queries: ${queryCount}`);

    const Order = mongoose.model("Order");
    const orderCount = await Order.countDocuments();
    logTest("Count Orders in DB", true, `Total orders: ${orderCount}`);
  } catch (error) {
    logTest("Database Operations", false, error.message);
  }

  // ===================== SUMMARY =====================
  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`✓ Passed: ${testResults.passed}`);
  console.log(`✗ Failed: ${testResults.failed}`);
  console.log(
    `Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`,
  );

  // Detailed results
  console.log("\n📝 DETAILED RESULTS:");
  console.log("-".repeat(60));
  testResults.tests.forEach((test) => {
    const icon = test.success ? "✓" : "✗";
    console.log(`${icon} ${test.name}`);
    if (test.details) console.log(`  └─ ${test.details}`);
  });

  console.log("\n" + "=".repeat(60));

  // Cleanup
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
    console.log("✓ Database disconnected");
  }

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("Test suite error:", error);
  process.exit(1);
});
