import jwt from "jsonwebtoken";

// Ensure token payload always contains an 'id' property
export const token = (payload) => {
  const body =
    payload && typeof payload === "object" && payload.id ?
      payload
    : { id: payload };
  return jwt.sign(body, process.env.JWT_SECRET || "mishraback_secret", {
    expiresIn: "30d",
  });
};

export const verify = (data) => {
  return jwt.verify(data, process.env.JWT_SECRET || "mishraback_secret");
};

export default token;
