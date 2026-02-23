const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");
const { registerValidation } = require("../middleware/validator");

// Helper to create Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Register User
exports.registerUser = async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const {
      fullName,
      email,
      stdCode,
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
      stdCode,
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
      console.error("Welcome email failed:", mailErr);
    }

    res.status(201).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      stdCode: user.stdCode,
      phone: user.phone,
      accountType: user.accountType,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.loginUser = async (req, res) => {
  try {
    const { email, password, accountType } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (user && (await user.matchPassword(password))) {
      if (user.accountType !== accountType) {
        return res
          .status(401)
          .json({
            message: `Access denied: This is a ${user.accountType} account`,
          });
      }

      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        stdCode: user.stdCode,
        phone: user.phone,
        accountType: user.accountType,
        businessName: user.businessName,
        gstNumber: user.gstNumber,
        address: user.address,
        pincode: user.pincode,
        locality: user.locality,
        city: user.city,
        profilePic: user.profilePic,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ user });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Profile & Documents
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = req.body.fullName || user.fullName;
    user.stdCode = req.body.stdCode || user.stdCode;
    user.phone = req.body.phone || user.phone;
    user.address = req.body.address || user.address;
    user.pincode = req.body.pincode || user.pincode;
    user.locality = req.body.locality || user.locality;
    user.city = req.body.city || user.city;

    if (user.accountType === "retailer") {
      user.businessName = req.body.businessName || user.businessName;
      user.gstNumber = req.body.gstNumber || user.gstNumber;
      user.panNumber = req.body.panNumber || user.panNumber;
      user.msmeNumber = req.body.msmeNumber || user.msmeNumber;
    }

    if (req.files) {
      if (req.files.profilePic)
        user.profilePic = `/uploads/${req.files.profilePic[0].filename}`;
      if (req.files.gstFile)
        user.gstFile = `/uploads/${req.files.gstFile[0].filename}`;
      if (req.files.panFile)
        user.panFile = `/uploads/${req.files.panFile[0].filename}`;
      if (req.files.msmeFile)
        user.msmeFile = `/uploads/${req.files.msmeFile[0].filename}`;
    }

    if (req.body.removeProfilePic === "true") {
      user.profilePic = null;
    }

    const updatedUser = await user.save();
    res.json({ message: "Atlas Profile Updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

    const passRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passRegex.test(newPassword)) {
      return res
        .status(400)
        .json({ message: "Password does not meet security criteria" });
    }

    user.password = newPassword;
    await user.save();
    res.json({ message: "Security Key Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) =>
  res.status(501).json({ message: "Not implemented" });
exports.verifyOTP = async (req, res) =>
  res.status(501).json({ message: "Not implemented" });
exports.resetPassword = async (req, res) =>
  res.status(501).json({ message: "Not implemented" });

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({});
    res.json({ message: "All users wiped" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
