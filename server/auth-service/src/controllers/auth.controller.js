const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Account = require("../models/Account");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/** Đăng nhập */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });
    if (!account) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: account._id, role: account.role }, JWT_SECRET, { expiresIn: "1h" });
    res.status(200).json({ token, role: account.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Kiểm tra token hợp lệ */
exports.verifyToken = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Thiếu token" });
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
};
