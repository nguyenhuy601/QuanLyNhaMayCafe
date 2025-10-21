const jwt = require("jsonwebtoken");
const axios = require("axios"); // gọi sang Auth-Service nếu cần verify từ xa

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware xác thực JWT token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Thiếu Authorization header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded; // gắn vào request
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};
