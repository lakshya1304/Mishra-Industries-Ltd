const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);

module.exports = router;

router.get('/all-users', async (req, res) => {
    try {
        const User = require('../models/User'); // Ensure Model is imported
        const users = await User.find({}).sort({ createdAt: -1 }); // Newest first
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Server Error fetching users" });
    }
});