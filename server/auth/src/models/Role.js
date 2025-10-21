const mongoose = require("mongoose");

/**
 * Role - Vai trò / quyền hệ thống (RBAC)
 */
const RoleSchema = new mongoose.Schema({
  maQuyen: { type: String, required: true, unique: true },
  tenQuyen: { type: String, required: true },
  moTa: String,
  privileges: [{ type: String }] // danh sách quyền/capability strings
}, { timestamps: true });

module.exports = mongoose.model("Role", RoleSchema);