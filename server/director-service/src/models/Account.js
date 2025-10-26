const mongoose = require("mongoose");

/**
 * Account - Tài khoản đăng nhập
 * - password lưu hash (bcrypt)
 */
const AccountSchema = new mongoose.Schema({
 username: { type: String, required: true, unique: true, index: true },
 password: { type: String, required: true },
 employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
 role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" },
 trangThai: { type: String, enum: ["Hoat dong","Khoa"], default: "Hoat dong" }
}, { timestamps: true });

module.exports = mongoose.model("Account", AccountSchema);