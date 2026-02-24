import jwt from "jsonwebtoken";

<<<<<<< HEAD
// Ensure token payload always contains an 'id' property
export const token = (payload) => {
  const body =
    payload && typeof payload === "object" && payload.id ?
      payload
    : { id: payload };
  return jwt.sign(body, process.env.JWT_SECRET || "mishraback_secret", {
=======
export const token = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || "mishraback_secret", {
>>>>>>> d6af449afae658f3056276f162bee9b4028035ad
    expiresIn: "30d",
  });
};

export const verify = (data) => {
<<<<<<< HEAD
  return jwt.verify(data, process.env.JWT_SECRET || "mishraback_secret");
=======
  return jwt.verify(data, process.env.JWT_SECRET);
>>>>>>> d6af449afae658f3056276f162bee9b4028035ad
};

export default token;
