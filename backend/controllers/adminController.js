import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/error.js";
import bcrypt from "bcryptjs";
import token from "../utils/token.js";

// Generate JWT Token

export const loginAdmin = asyncHandler(async (req, res) => {
  if (req?.user && req?.user?.id) {
    return err(res, "Kindly logout before loggin in", 400);
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return err(res, "Both email and password are required", 400);
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return err(res, "No user was found", 404);
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return err(res, "Invalid password", 400);
  }
  // Set an admin-specific cookie
  res.cookie("admin_session", token(admin._id), {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  return success(
    res,
    `Welcome back ${admin?.username ?? admin?.name ?? "Admin"}`,
    200,
    {
      id: admin._id,
      email: admin.email,
      isAdmin: true,
      token: token(admin._id),
    },
  );
});

export default loginAdmin;
