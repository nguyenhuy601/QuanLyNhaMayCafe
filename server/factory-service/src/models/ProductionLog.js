const mongoose = require("mongoose");

/**
 * ProductionLog - Ghi nhận sản lượng theo ca/tổ
 * Cache các thông tin liên quan để không phụ thuộc DB dịch vụ khác
 */
const ProductionLogSchema = new mongoose.Schema(
  {
    maBanGhi: { type: String, required: true, unique: true, index: true },
    phanCong: { type: mongoose.Schema.Types.ObjectId, ref: "WorkAssignment", required: true },
    keHoach: {
      planId: String,
      maKeHoach: String,
    },
    xuong: {
      id: String,
      tenXuong: String,
    },
    to: {
      id: String,
      tenTo: String,
    },
    ca: {
      id: String,
      tenCa: String,
      gioBatDau: String,
      gioKetThuc: String,
    },
    ngay: { type: Date, required: true },
    sanPham: {
      productId: String,
      tenSanPham: String,
      maSP: String,
    },
    soLuongThucTe: { type: Number, default: 0 },
    soLuongDat: { type: Number, default: 0 },
    soLuongLoi: { type: Number, default: 0 },
    chiTietLoi: [
      {
        code: String,
        moTa: String,
        soLuong: Number,
        ghiChu: String,
      },
    ],
    nguoiGhi: {
      id: String,
      hoTen: String,
    },
    trangThai: {
      type: String,
      enum: ["Dang ghi", "Cho kiem tra", "Da gui QC"],
      default: "Dang ghi",
    },
    ghiChu: String,
  },
  { timestamps: true }
);

ProductionLogSchema.pre("validate", function (next) {
  if (!this.maBanGhi) {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
    this.maBanGhi = `LOG-${stamp}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  }
  if (!this.ngay) {
    this.ngay = new Date();
  }
  next();
});

module.exports = mongoose.model("ProductionLog", ProductionLogSchema);