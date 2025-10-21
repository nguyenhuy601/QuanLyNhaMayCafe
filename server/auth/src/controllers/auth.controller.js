const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Account = require("../models/Account");
const Employee = require("../models/Employee");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Đăng ký tài khoản mới (Admin / HR tạo)
 */
exports.register = async (req, res) => {
  try {
    const { username, password, employeeId, role } = req.body;

    // Kiểm tra tồn tại
    const existed = await Account.findOne({ username });
    if (existed) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });

    // Mã hóa mật khẩu
    const hashed = await bcrypt.hash(password, 10);

    const account = await Account.create({
      username,
      password: hashed,
      employee: employeeId,
      role,
    });

    res.status(201).json({ message: "Tạo tài khoản thành công", account });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Đăng nhập hệ thống
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const account = await Account.findOne({ username }).populate("employee role");
    if (!account) return res.status(404).json({ message: "Tài khoản không tồn tại" });

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      {
        id: account._id,
        username: account.username,
        role: account.role?.tenQuyen,
        employeeId: account.employee?._id,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.status(200).json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: account._id,
        username: account.username,
        role: account.role?.tenQuyen,
        employee: account.employee?.hoTen,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Xác minh token (Middleware sẽ dùng)
 */
exports.verifyToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Thiếu token" });

    const decoded = jwt.verify(token, JWT_SECRET);
    const account = await Account.findById(decoded.id).populate("role employee");
    if (!account) return res.status(404).json({ message: "Tài khoản không tồn tại" });

    res.status(200).json({ message: "Token hợp lệ", user: decoded });
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ", error: err.message });
  }
};