import jwt from "jsonwebtoken";

export const token = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "mishraback_secret", {
    expiresIn: "30d",
  });
};

export const verify = (data) => {
  return jwt.verify(data, process.env.JWT_SECRET);
};

export default token;
