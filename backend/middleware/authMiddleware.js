import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/error.js";
import { verify } from "../utils/token.js";

// Robust protect middleware supporting Authorization header or cookie (user_session)
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1) Authorization header (Bearer)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2) Cookie header (fallback) - parse user_session, token, or auth
  if (!token && req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").map((c) => c.trim());
    const session = cookies.find(
      (c) =>
        c.startsWith("user_session=") ||
        c.startsWith("token=") ||
        c.startsWith("auth="),
    );
    if (session) token = session.split("=")[1];
  }

  if (!token) return err(res, "Not authorized, no token", 401);

  try {
    const decoded = verify(token);
    // decoded should contain .id based on how tokens are generated
    const userId = decoded?.id || decoded;
    const user = await User.findById(userId).select("-password");
    if (!user) return err(res, "User not found", 401);
    // attach full user (without password) so controllers can access _id and other fields
    req.user = user;
    return next();
  } catch (error) {
    return err(res, "Not authorized, token failed", 401);
  }
});

export default {
  protect,
};
