const jwt = require("jsonwebtoken");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Middleware xác thực JWT token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.log("Thiếu Authorization header");
      return res.status(401).json({ message: "Thiếu Authorization header" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      console.log("Thiếu token");
      return res.status(401).json({ message: "Thiếu token" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;

    next();
  } catch (err) {
    console.log("Token không hợp lệ:", err.message);
    res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};