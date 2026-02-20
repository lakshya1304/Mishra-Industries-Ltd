const express = require("express");
const router = express.Router();
const User = require("../models/User"); // Imported once at the top

// Import all controllers
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword, // Added for permanent reset logic
} = require("../controllers/authController");

// --- Public Routes ---
router.post("/register", registerUser);
router.post("/login", loginUser);

// --- Password Recovery Routes ---
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword); // New route for final step

// --- Admin/Management Routes ---
/**
 * @desc Get all registered users (Customer/Retailer)
 * @route GET /api/auth/all-users
 */
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }); // Newest first
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching users" });
  }
});

module.exports = router; // Must be at the very bottom
