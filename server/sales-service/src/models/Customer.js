const mongoose = require("mongoose");

/**
 * Customer - Khách hàng
 */
const CustomerSchema = new mongoose.Schema({
  tenKH: { type: String, required: true },
  sdt: { type: String, required: true, unique: true }, // ⚡ nên đặt unique để tránh trùng số
  email: String,
  diaChi: String,
  loaiKH: { type: String, enum: ["Cá nhân", "Doanh nghiệp"], default: "Cá nhân" },
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("Customer", CustomerSchema);
