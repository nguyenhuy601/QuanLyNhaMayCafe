const mongoose = require("mongoose");

/**
 * ProductionPlan - Phiếu kế hoạch sản xuất
 * - tạo sau khi đơn hàng được duyệt
 */
const ProductionPlanSchema = new mongoose.Schema({
  maKeHoach: { type: String, required: true, unique: true },
  donHangLienQuan: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  soLuongCanSanXuat: Number,
  ngayBatDauDuKien: Date,
  ngayKetThucDuKien: Date,
  xuongPhuTrach: String,
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayLap: { type: Date, default: Date.now },
  trangThai: { type: String, enum: ["Chua duyet","Da duyet","Dang thuc hien","Hoan thanh"], default: "Chua duyet" },
  nvlCanThiet: [
    { nvl: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, soLuong: Number }
  ],
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("ProductionPlan", ProductionPlanSchema);