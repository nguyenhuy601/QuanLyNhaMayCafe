const mongoose = require("mongoose");

/**
 * Supplier - Nhà cung cấp
 */
const SupplierSchema = new mongoose.Schema({
  maNCC: { type: String, required: true, unique: true },
  tenNCC: { type: String, required: true },
  diaChi: String,
  sdt: String,
  email: String,
  maSoThue: String,
  ghiChu: String,
  trangThai: { type: String, default: "Đang hợp tác" }
}, { timestamps: true });

module.exports = mongoose.model("Supplier", SupplierSchema);