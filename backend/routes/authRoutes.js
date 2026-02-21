const express = require("express");
const router = express.Router();
const User = require("../models/User");

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  deleteUser,
  deleteAllUsers// Make sure this is imported
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

router.delete("/delete-user/:id", deleteUser);
router.delete("/delete-all-users", deleteAllUsers); 

module.exports = router;