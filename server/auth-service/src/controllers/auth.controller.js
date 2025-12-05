const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Account = require("../models/Account");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";
// Log JWT_SECRET info (first 4 chars only for security)
if (!process.env.JWT_SECRET_LOGGED) {
  console.log(`🔑 [auth-service] JWT_SECRET configured: ${JWT_SECRET.substring(0, 4)}... (length: ${JWT_SECRET.length})`);
  process.env.JWT_SECRET_LOGGED = "true";
}
const VALID_ROLES = [
  "admin",
  "worker",
  "director",
  "qc",
  "plan",
  "orders",
  "xuongtruong", // Xưởng trưởng
  "totruong",    // Tổ trưởng
  "khonvl",      // Kho nguyên vật liệu
  "khotp",       // Kho thành phẩm (thay thế warehouseproduct)
];

/** Register a new account */
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    // Validate role (default = worker)
    const requestedRole = role || "worker";
    if (!VALID_ROLES.includes(requestedRole)) {
      return res.status(400).json({ message: "Role không phù hợp" });
    }
    const finalRole = requestedRole;

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashed,
      role: finalRole,
    });

    // Generate JWT
    const token = jwt.sign(
      { id: account._id, role: finalRole },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Register successfully",
      token,
      role: finalRole,
    });
  } catch (err) {
    console.error("❌ [register error]", err);
    res.status(500).json({ error: err.message });
  }
};

/** Login */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const account = await Account.findOne({ email });
    if (!account)
      return res.status(404).json({ message: "Account not found" });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    if (!VALID_ROLES.includes(account.role)) {
      return res.status(403).json({ message: "Role không phù hợp" });
    }

    const token = jwt.sign(
      { 
        id: account._id, 
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [], // Lưu vào JWT để dùng khi cần
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, role: account.role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Verify JWT token */
exports.verifyToken = async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: "Missing token" });

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ valid: false });
  }
};

/** Lấy thông tin account theo ID */
exports.getAccountById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id).select("-password");
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }
    res.status(200).json(account);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin gán sản phẩm phụ trách cho xưởng trưởng */
exports.assignProductsToManager = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { sanPhamPhuTrach } = req.body;

    // Kiểm tra account có tồn tại không
    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Kiểm tra role phải là xưởng trưởng
    if (account.role !== "xuongtruong") {
      return res.status(400).json({ 
        message: "Chỉ có thể gán sản phẩm phụ trách cho xưởng trưởng. Vui lòng đổi role của account thành 'xuongtruong' trước." 
      });
    }

    // Validate danh sách sản phẩm
    if (!Array.isArray(sanPhamPhuTrach)) {
      return res.status(400).json({ 
        message: "sanPhamPhuTrach phải là mảng" 
      });
    }

    // Kiểm tra: chỉ cho phép 1 sản phẩm
    if (sanPhamPhuTrach.length > 1) {
      return res.status(400).json({ 
        message: "Một xưởng trưởng chỉ có thể phụ trách 1 sản phẩm duy nhất" 
      });
    }

    // Nếu có sản phẩm được gán, kiểm tra xem sản phẩm đó đã được gán cho account khác chưa
    if (sanPhamPhuTrach.length === 1) {
      const productId = sanPhamPhuTrach[0].productId;
      if (productId) {
        // Tìm account khác đã có sản phẩm này (trừ account hiện tại)
        const existingAccount = await Account.findOne({
          _id: { $ne: accountId },
          role: "xuongtruong",
          "sanPhamPhuTrach.productId": productId
        });

        if (existingAccount) {
          return res.status(400).json({ 
            message: `Sản phẩm này đã được gán cho tài khoản ${existingAccount.email}. Một sản phẩm chỉ có thể được gán cho 1 tài khoản duy nhất.` 
          });
        }
      }
    }

    // Cập nhật danh sách sản phẩm phụ trách (chỉ lưu khi role là xuongtruong)
    account.sanPhamPhuTrach = sanPhamPhuTrach;
    await account.save();

    res.status(200).json({ 
      message: "Đã cập nhật sản phẩm phụ trách thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy danh sách account (admin) */
exports.getAccounts = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) {
      filter.role = role;
    }
    
    const accounts = await Account.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });
    
    res.status(200).json(accounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin cập nhật role của account */
exports.updateAccountRole = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ message: "Role là bắt buộc" });
    }

    // Validate role
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Cập nhật role
    account.role = role;
    
    // Nếu đổi từ xuongtruong sang role khác, xóa sanPhamPhuTrach
    if (account.role !== "xuongtruong" && account.sanPhamPhuTrach?.length > 0) {
      account.sanPhamPhuTrach = undefined;
    }
    
    await account.save();

    res.status(200).json({ 
      message: "Đã cập nhật role thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Admin tạo account mới */
exports.createAccount = async (req, res) => {
  try {
    const { email, password, role, isActive } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email và password là bắt buộc" });
    }

    // Check if email already exists
    const existing = await Account.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Validate role
    const finalRole = role || "worker";
    if (!VALID_ROLES.includes(finalRole)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create account
    const account = await Account.create({
      email,
      password: hashed,
      role: finalRole,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      message: "Tạo tài khoản thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        isActive: account.isActive,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/** Admin cập nhật account */
exports.updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { email, password, role, isActive } = req.body;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Update email if provided
    if (email && email !== account.email) {
      const existing = await Account.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "Email đã tồn tại" });
      }
      account.email = email;
    }

    // Update password if provided
    if (password) {
      account.password = await bcrypt.hash(password, 10);
    }

    // Update role if provided
    if (role) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ message: "Role không hợp lệ" });
      }
      account.role = role;
      
      // Nếu đổi từ xuongtruong sang role khác, xóa sanPhamPhuTrach
      if (account.role !== "xuongtruong" && account.sanPhamPhuTrach?.length > 0) {
        account.sanPhamPhuTrach = undefined;
      }
    }

    // Update isActive if provided
    if (isActive !== undefined) {
      account.isActive = isActive;
    }

    await account.save();

    res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      account: {
        _id: account._id,
        email: account.email,
        role: account.role,
        isActive: account.isActive,
        sanPhamPhuTrach: account.sanPhamPhuTrach || [],
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    res.status(500).json({ error: err.message });
  }
};

/** Admin xóa account */
exports.deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Không cho phép xóa admin
    if (account.role === "admin") {
      return res.status(400).json({ message: "Không thể xóa tài khoản admin" });
    }

    await Account.findByIdAndDelete(accountId);

    res.status(200).json({ message: "Đã xóa tài khoản thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};