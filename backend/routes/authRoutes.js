const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateProfile,
  changePassword,
  getProfile,
  deleteUser,
  deleteAllUsers,
} = require("../controllers/authController");

// ================== MULTER CONFIGURATION ==================

// Ensure upload directory exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Unique filename: fieldname + timestamp + extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

// File filter to allow only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg and .pdf formats are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
});

// Defining the fields for upload
const cpUpload = upload.fields([
  { name: "profilePic", maxCount: 1 },
  { name: "gstFile", maxCount: 1 },
  { name: "panFile", maxCount: 1 },
  { name: "msmeFile", maxCount: 1 },
]);

// ================== ROUTES ==================

// Public Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Profile & Security Routes (With Multer Middleware)
router.get("/profile", protect, getProfile);
router.put("/update-profile", protect, cpUpload, updateProfile); // 'cpUpload' handles files
router.put("/change-password", protect, changePassword);

// Management Routes
router.get("/all-users", async (req, res) => {
  try {
    const User = require("../models/User");
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
});

router.delete("/delete-user/:id", deleteUser);
router.delete("/delete-all-users", deleteAllUsers);

module.exports = router;
