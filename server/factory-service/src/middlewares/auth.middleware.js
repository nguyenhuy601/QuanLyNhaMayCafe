const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const JWT_SECRET = process.env.JWT_SECRET;

// Schema cho Account (tạm thời, để query từ DB)
const AccountSchema = new mongoose.Schema({
  email: String,
  password: String,
  role: String,
  isActive: Boolean,
  sanPhamPhuTrach: [{
    productId: String,
    maSP: String,
    tenSP: String,
  }],
}, { collection: 'accounts', timestamps: true });

// Lấy connection từ mongoose (giả sử đã connect)
let Account;
try {
  Account = mongoose.models.Account || mongoose.model("Account", AccountSchema);
} catch (e) {
  Account = mongoose.model("Account", AccountSchema);
}

/**
 * Middleware xác thực JWT token và lấy thông tin Account
 */
exports.verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Thiếu Authorization header" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Query Account từ DB để lấy sanPhamPhuTrach
    try {
      const account = await Account.findById(decoded.id);
      if (account) {
        req.user = {
          id: account._id,
          email: account.email,
          role: account.role,
          sanPhamPhuTrach: account.sanPhamPhuTrach || [],
        };
      } else {
        // Nếu không tìm thấy account, dùng thông tin từ JWT
        req.user = decoded;
      }
    } catch (dbErr) {
      // Nếu lỗi query DB, dùng thông tin từ JWT
      console.warn("⚠️ [factory-service] Could not fetch account from DB:", dbErr.message);
      req.user = decoded;
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};
