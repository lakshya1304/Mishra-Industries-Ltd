const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware"); // Ensure this path is correct

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,   // Added import
  deleteUser,      // Added import to fix crash
  deleteAllUsers,  // Added import to fix crash
} = require("../controllers/authController");

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Management Routes
router.get("/all-users", async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error fetching users" });
  }
});

// FIXED: Corrected route definitions to prevent "argument handler must be a function" error
router.delete("/delete-user/:id", deleteUser); // Line 32
router.delete("/delete-all-users", deleteAllUsers);

// Profile Routes
router.put("/update-profile", protect, updateProfile); // Fixed with protect middleware

module.exports = router;