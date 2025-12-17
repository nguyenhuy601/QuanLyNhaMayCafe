const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Middleware xác thực token JWT (không phụ thuộc model Account)
 * Lấy thông tin role/user trực tiếp từ payload token.
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Thiếu header Authorization" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn user vào request từ payload token
    req.user = {
      id: decoded.id || decoded.userId || decoded._id,
      username: decoded.username || decoded.email,
      role: decoded.role || decoded.roles || decoded.quyen,
      employee: decoded.hoTen || decoded.name,
      email: decoded.email,
      roles: decoded.roles || decoded.role || [], // thêm trường roles dạng mảng để tiện normalize
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};