const jwt = require("jsonwebtoken");
const Account = require("../models/Account");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Middleware xác thực token JWT
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "Thiếu header Authorization" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);

    const account = await Account.findById(decoded.id);
    if (!account) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    // Gắn user vào request để controller có thể dùng
    req.user = {
      id: account._id,
      email: account.email,
      role: account.role,
      sanPhamPhuTrach: account.sanPhamPhuTrach || [], // Danh sách sản phẩm phụ trách (cho xưởng trưởng)
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};