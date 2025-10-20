const mongoose = require("mongoose");

/**
 * Team - Tổ sản xuất
 * - đại diện cho tổ (ví dụ: Tổ 1, Tổ 2)
 * - tổ có tổ trưởng (employee)
 */
const TeamSchema = new mongoose.Schema({
  maTo: { type: String, required: true, unique: true },
  tenTo: { type: String, required: true },
  toTruong: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // tổ trưởng
  thanhVien: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  moTa: String
}, { timestamps: true });

module.exports = mongoose.model("Team", TeamSchema);