import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import err from "../utils/err.js";
import { verify } from "../utils/token.js";

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (
    (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")) ||
    req.cookies("cookie")
  ) {
    token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = verify(token);
      let user = await User.findById(decoded.id).select("-password");
      if (!user) return err(res, "User not found", 401);
      req.user = { id: user._id };
      return next();
    } catch (error) {
      return err(res, "Not authorized, token failed", 401);
    }
  }
  return err(res, "Not authorized, no token", 401);
});

export default {
  protect,
};
