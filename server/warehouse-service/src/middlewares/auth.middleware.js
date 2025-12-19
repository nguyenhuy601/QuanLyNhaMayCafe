const jwt = require("jsonwebtoken");
const axios = require("axios");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Middleware xác thực JWT token
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Thiếu Authorization header" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Normalize role từ nhiều nguồn có thể
    const normalizeRole = (payload) => {
      if (!payload) return null;
      // Thử nhiều trường có thể chứa role
      return payload.role?.tenQuyen || 
             payload.role?.name || 
             payload.role?.maQuyen ||
             payload.tenQuyen || 
             payload.userRole ||
             payload.role ||
             null;
    };

    req.user = {
      ...decoded,
      role: normalizeRole(decoded),
      roles: decoded.roles || (decoded.role ? [decoded.role] : []),
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};
