import User from "../models/User.js";
import sendEmail from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
// Ensure this destructured import matches the object export in validator.js
import { registerValidation } from "../middleware/validator.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/error.js";
import success from "../utils/success.js";
import token from "../utils/token.js";

// Helper to create Token
const passRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
export const registerUser = asyncHandler(async (req, res) => {
  // Check validation results from Joi first
  const { error } = registerValidation(req.body);
  if (error) return err(res, error.details[0].message, 400);

  const {
    fullName,
    email,
    phone,
    password,
    accountType,
    businessName,
    gstNumber,
  } = req.body;

  // Check for existing users to prevent database crashes
  // Uses $or to check if either email OR phone already exists in the collection
  const userExists = await User.findOne({ $or: [{ email }, { phone }] });

  if (userExists) {
    // Direct message if record found in Atlas
    return err(res, "Email or Phone already registered", 400);
  }

  // Create user without stdCode as per your request
  const user = await User.create({
    fullName,
    email,
    phone,
    password,
    accountType,
    businessName,
    gstNumber,
  });
  if (!user) return err(res, "Registration failed", 400);

  try {
    await sendEmail({
      email: user.email,
      subject: "Welcome to Mishra Industries Limited",
      type: "welcome",
      name: user.fullName,
      accountType: user.accountType,
    });
  } catch (mailErr) {
    err(res, `Welcome email failed${mailErr}`, 500);
  }

  success(res, "User successfully registered", 200, {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    accountType: user.accountType,
    token: token(user._id),
  });
});

// Login
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password, accountType } = req.body;
  const user = await User.findOne({ email });
  if (!user) return err(res, "User not found, kindly register", 404);
  let passMatch = await user.matchPassword(password);
  if (!passMatch) {
    return err(res, "Invalid credentials", 400);
  }

  if (user.accountType !== accountType) {
    return err(
      res,
      `Access denied: This is a ${user.accountType} account`,
      401,
    );
  }
  res.cookie("user_session", token(user._id), {
    httpOnly: true,
    // Only set secure in production so local HTTP tests work
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  success(res, "Successfully logged in", 200, {
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    accountType: user.accountType,
    businessName: user.businessName,
    gstNumber: user.gstNumber,
    address: user.address,
    pincode: user.pincode,
    locality: user.locality,
    city: user.city,
    profilePic: user.profilePic,
    token: token(user._id),
  });
});

// Get Profile
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) {
    return err(res, "User not found, Kindly login", 404);
  }
  return success(res, "User found", 200, user);
});

// Update Profile & Documents
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req?.user?._id);
  if (!user) return err(res, "User not found", 404);

  // Update Text Fields
  user.fullName = req.body.fullName || user.fullName;
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

  // Update Files
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
  return success(res, "User Profile Updated", 202, updatedUser);
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return err(res, "Both fields are required", 400);
  }
  const user = await User.findById(req?.user?._id);

  if (!(await user.matchPassword(oldPassword))) {
    return err(res, "Current password incorrect", 401);
  }

  if (!passRegex.test(newPassword)) {
    return err(res, "Password does not meet security criteria", 400);
  }

  user.password = newPassword;
  await user.save();
  return success(res, "Password Updated successfully", 200);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  let { email } = req.body;
  if (!email) {
    return err(res, "Email are required", 400);
  }
  let user = await User.findOne({ email });
  if (!user) {
    return err(res, "User with email not found", 404);
  }
  // Generate 6-digit OTP and set expiry (3 minutes)
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  const hashOTP = await bcrypt.hash(OTP, 10);
  const expiry = Date.now() + 3 * 60 * 1000; // 3 minutes

  // Use dedicated reset fields on User model
  user.resetPasswordOTP = hashOTP;
  user.resetPasswordExpire = new Date(expiry);
  const otpSaved = await user.save();

  try {
    await sendEmail(
      email,
      "Mishra Industries - Password Reset OTP",
      `Your OTP is: ${OTP}`,
    );
  } catch (mailErr) {
    console.error("Mail error:", mailErr);
    return err(res, "Failed to send OTP email", 500);
  }

  if (!otpSaved) return err(res, "Could not save OTP", 500);
  // For automated testing / local debugging, return the OTP when not in production
  if (process.env.NODE_ENV !== "production") {
    return success(res, "OTP sent", 200, { debugOTP: OTP });
  }
  return success(res, "OTP sent", 200);
});

export const verifyOTP = asyncHandler(async (req, res) => {
  let { otp, email } = req.body;
  if (!otp || !email) {
    return err(res, "Both fields are required", 400);
  }
  let user = await User.findOne({ email });
  if (!user) {
    return err(res, "User with email not found", 404);
  }
  // Check expiry
  if (!user.resetPasswordExpire || user.resetPasswordExpire < Date.now()) {
    return err(res, "OTP expired", 400);
  }

  const match = await bcrypt.compare(
    otp.toString(),
    user.resetPasswordOTP || "",
  );
  if (!match) return err(res, "Invalid OTP", 400);

  // Mark email verified for the scope of password reset
  user.resetPasswordOTP = null;
  user.resetPasswordExpire = null;
  user.emailVerified = true;
  const updated = await user.save();
  if (!updated) return err(res, "OTP validation failed", 500);
  return success(res, "OTP verified", 200);
});

export const resetPassword = asyncHandler(async (req, res) => {
  let { newPassword, email } = req.body;
  if (!newPassword || !email) {
    return err(res, "Both fields are required", 404);
  }
  let user = await User.findOne({ email });
  if (!user) {
    return err(res, "User with email not found");
  }
  if (!user.emailVerified) {
    return err(res, "OTP not verified", 400);
  }
  if (!passRegex.test(newPassword)) {
    return err(res, "Password does not meet security criteria", 400);
  }
  user.password = newPassword;
  let updated = await user.save();
  if (!updated) {
    return err(res, "Password failed to update", 500);
  }
  return success(res, "Password changed successfully", 202);
});

export const deleteUser = asyncHandler(async (req, res) => {
  let user = await User.findByIdAndDelete(req.params.id);
  if (!user) return err(res, "User not found to delete", 404);
  return success(res, "User deleted successfully", 200, user);
});

export const deleteAllUsers = asyncHandler(async (req, res) => {
  let users = await User.deleteMany({});
  if (!users) {
    return err(res, "Either users already wiped out or never existed", 400);
  }
  return success(res, "All users wiped", 200);
});

export default {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyOTP,
  resetPassword,
  deleteUser,
  deleteAllUsers,
};
