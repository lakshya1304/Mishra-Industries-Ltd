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
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const {
      fullName,
      email,
      phone,
      password,
      accountType,
      businessName,
      gstNumber,
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Email or Phone already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      accountType,
      businessName,
      gstNumber,
    });

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
      email: user.email, // CRITICAL: Included for frontend sync
      phone: user.phone, // CRITICAL: Included for frontend sync
      accountType: user.accountType,
      gstNumber: user.gstNumber,
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
      if (user.accountType !== accountType) {
        return res.status(401).json({
          message: `Access denied: This is a ${user.accountType} account`,
        });
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email, // CRITICAL: Frontend needs this
        phone: user.phone, // CRITICAL: Frontend needs this
        gender: user.gender,
        accountType: user.accountType,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
        address: user.address,
        pincode: user.pincode,
        locality: user.locality,
        city: user.city,
        state: user.state,
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
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "No user found with this email" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetPasswordOTP = otp;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset OTP - Mishra Industries",
      message: "Your verification code for password reset is:",
      otp: otp,
      type: "otp",
    });
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(500).json({ message: "Email could not be sent." });
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

    if (!user)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated permanently." });
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

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // From protect middleware

    if (user) {
      // 1. Personal Details Update
      user.fullName = req.body.fullName || user.fullName;
      user.phone = req.body.phone || user.phone;
      user.gender = req.body.gender || user.gender;

      // 2. Address Details Update
      user.address = req.body.address || user.address;
      user.pincode = req.body.pincode || user.pincode;
      user.locality = req.body.locality || user.locality;
      user.city = req.body.city || user.city;
      user.state = req.body.state || user.state;

      // 3. Account Type Migration logic
      if (req.body.accountType) {
        user.accountType = req.body.accountType;
      }

      if (user.accountType === "retailer") {
        user.businessName = req.body.businessName || user.businessName;
        user.gstNumber = req.body.gstNumber || user.gstNumber;
      }

      const updatedUser = await user.save();

      // Sending full updated object back to frontend
      res.json({
        message: "Profile and Address Updated",
        user: updatedUser,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
