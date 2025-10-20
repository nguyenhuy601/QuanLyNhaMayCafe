const mongoose = require("mongoose");

/**
 * Account - Tài khoản dùng để đăng nhập
 */
const AccountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // lưu hash
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // role hệ thống
  trangThai: { type: String, default: "Hoạt động" },
}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);