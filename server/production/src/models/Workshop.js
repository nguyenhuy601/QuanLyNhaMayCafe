const mongoose = require("mongoose");

/**
 * Workshop - Xưởng sản xuất
 * - Mỗi xưởng có xưởng trưởng và nhiều tổ trực thuộc
 */
const WorkshopSchema = new mongoose.Schema({
  maXuong: { type: String, required: true, unique: true },
  tenXuong: { type: String, required: true },
  xuongTruong: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  danhSachTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  moTa: String,
  trangThai: { type: String, default: "Hoạt động" }
}, { timestamps: true });

module.exports = mongoose.model("Workshop", WorkshopSchema);