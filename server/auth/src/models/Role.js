const mongoose = require("mongoose");

/**
 * Role - Vai trò / quyền hệ thống (Ban giám đốc, Quản lý kế hoạch, Xưởng trưởng, Tổ trưởng, QC, Kho, Nhân viên...)
 */
const RoleSchema = new mongoose.Schema({
  maQuyen: { type: String, required: true, unique: true },
  tenQuyen: { type: String, required: true },
  moTa: String,
  privileges: [String] // danh sách quyền chi tiết (tuỳ mở rộng)
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);