const mongoose = require("mongoose");

/**
 * Employee - Nhân viên
 * - có thể là Xưởng trưởng / Tổ trưởng / Công nhân / Nhân viên kho / Người lập phiếu...
 */
const EmployeeSchema = new mongoose.Schema({
  maNV: { type: String, required: true, unique: true },
  hoTen: { type: String, required: true },
  gioiTinh: String,
  ngaySinh: Date,
  diaChi: String,
  sdt: String,
  email: String,
  ngayVaoLam: Date,
  phongBan: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  chucVu: { type: mongoose.Schema.Types.ObjectId, ref: "Position" },
  role: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // phân quyền hệ thống
  luongCoBan: Number,
  trangThai: { type: String, default: "Đang làm" },
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);