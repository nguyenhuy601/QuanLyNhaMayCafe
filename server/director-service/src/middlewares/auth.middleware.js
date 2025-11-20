const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const normalizeRole = (payload) =>
  payload?.role?.tenQuyen ||
  payload?.role?.name ||
  payload?.role ||
  payload?.tenQuyen ||
  payload?.userRole;

/**
 * Middleware xác thực token JWT
 * (stateless: chỉ dựa vào payload JWT, không truy vấn DB)
 */
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "Thiếu header Authorization" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.id || decoded._id,
      username: decoded.username || decoded.email || decoded.account,
      role: normalizeRole(decoded),
      employee: decoded.employee?.hoTen || decoded.employeeName || decoded.hoTen,
      raw: decoded,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};