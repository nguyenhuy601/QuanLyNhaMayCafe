const mongoose = require("mongoose");

/**
 * Salary - Bảng lương (lưu lịch sử tính lương theo tháng)
 * - dùng dữ liệu chấm công để tính; chứa thuế, thưởng, phạt
 */
const SalarySchema = new mongoose.Schema({
  nhanVien: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  thang: { type: String, required: true }, // "2025-10"
  luongCoBan: Number,
  heSoLuong: Number,
  soNgayCong: Number,
  luongTangCa: Number,
  thuong: Number,
  phat: Number,
  tamUng: Number,
  tongLuong: Number,
  ngayTinhLuong: Date,
  nguoiTinh: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // người lập bảng lương
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("Salary", SalarySchema);