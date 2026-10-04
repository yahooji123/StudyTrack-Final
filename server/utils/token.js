import jwt from "jsonwebtoken";

export const createToken = (user) => {
  return jwt.sign(
    { userId: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};
