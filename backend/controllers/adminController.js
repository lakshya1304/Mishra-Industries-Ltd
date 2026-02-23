import Admin from "../models/Admin.js";
import asyncHandler from "../utils/asyncHandler.js";
import error from "../utils/error.js";
import bcrypt from "bcryptjs";
import token from "../utils/token.js";

// Generate JWT Token

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return error(res, "Both email and password are required", 400);
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return error(res, "No user was found", 404);
  }

  if (!bcrypt.compare(admin.password, password)) {
    return error(res, "Invalid password", 400);
  }
  return success(
    res,
    `Welcome back ${admin?.username ?? admin?.name ?? "Admin"}`,
    200,
    {
      _id: admin._id,
      email: admin.email,
      isAdmin: true,
      token: token(admin._id),
    },
  );
});

export default loginAdmin;
