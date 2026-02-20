const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { registerValidation } = require("../middleware/validator");

// Helper to create Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register new user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  // 1. Validate data using Joi
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const { fullName, email, phone, password, accountType, businessName } =
      req.body;

    // Check if phone or email already exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email or Phone already registered" });
    }

    // Create user in Atlas
    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      accountType,
      businessName,
    });

    // --- AUTOMATED REAL-TIME WELCOME EMAIL ---
    try {
      await sendEmail({
        email: user.email,
        subject: "Welcome to Mishra Industries Limited",
        type: "welcome",
        name: user.fullName,
        accountType: user.accountType,
      });
    } catch (mailErr) {
      console.error("Welcome email failed, but user created:", mailErr);
    }

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      accountType: user.accountType,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      // Strict validation for Account Type
      if (user.accountType !== accountType) {
        return res.status(401).json({
          message: `Access denied: This is a ${user.accountType} account`,
        });
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        accountType: user.accountType,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Send OTP to Gmail
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  
  // Only search for registered users to prevent unauthorized email usage
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "No user found with this email" });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // --- DEBUG LOGS ---
  console.log(`[OTP GENERATED] Email: ${email} | OTP: ${otp}`);

  // Save OTP to user record (valid for 10 mins)
  user.resetPasswordOTP = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP - Mishra Industries",
      message: "Your verification code for password reset is:",
      otp: otp,
      type: "otp" 
    });

    console.log(`[MAIL DISPATCHED] Successfully sent to ${user.email}`);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(`[MAIL ERROR] Failed for ${user.email}:`, err.message);
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: "Email could not be sent. Check backend logs." });
  }
};
// @desc    Verify OTP and Update Password Permanently
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Update password (Schema handles auto-hashing via pre-save hook)
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated permanently. You can now login.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Log User In
// @route   POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.resetPasswordOTP !== otp ||
      user.resetPasswordExpire < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      _id: user._id,
      fullName: user.fullName,
      accountType: user.accountType,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
