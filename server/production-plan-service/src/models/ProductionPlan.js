const mongoose = require("mongoose");

/**
 * ProductionPlan - Production Planning Document
 */
const ProductionPlanSchema = new mongoose.Schema(
  {
    maKeHoach: { type: String, unique: true },
    donHangLienQuan: [
      {
        orderId: { type: String, required: true },   // ID từ service Sales
        maDonHang: String,                           // cache mã đơn hàng
        tenKhachHang: String,                        // cache
        tongTien: Number                             // cache
      }
    ],
    sanPham: {
      productId: { type: String, required: true }, // ID của product bên Sales
      tenSanPham: String, // (optional) lưu cache tên để hiển thị nhanh
      maSP: String,       // (optional) lưu mã sản phẩm nếu cần
      loai: { type: String, enum: ["sanpham", "nguyenvatlieu"], default: "sanpham" }, // Loại sản phẩm
    },
    soLuongCanSanXuat: Number,
    ngayBatDauDuKien: Date,
    ngayKetThucDuKien: Date,
    xuongPhuTrach: String,
    nguoiLap: { type: String }, // Store user ID as string instead of ref
    ngayLap: { type: Date, default: Date.now },
    trangThai: {
      type: String,
      enum: ["Chưa duyệt", "Đã duyệt", "Đang thực hiện", "Hoàn thành"],
      default: "Chưa duyệt",
    },
    nvlCanThiet: [
      {
        productId: { type: String },
        tenNVL: String,
        maSP: String,
        soLuong: Number,
        loai: { type: String, enum: ["sanpham", "nguyenvatlieu"], default: "nguyenvatlieu" },
      },
    ],
    ghiChu: String,
  },
  { timestamps: true }
);

/**
 * Auto-generate maKeHoach before save
 * Format: KH-YYYYMMDD-XXX
 */
ProductionPlanSchema.pre("save", async function (next) {
  if (!this.maKeHoach) {
    const today = new Date();
    const dateCode = today
      .toISOString()
      .split("T")[0]
      .replace(/-/g, ""); // YYYYMMDD

    const count = await mongoose.model("ProductionPlan").countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    const seq = (count + 1).toString().padStart(3, "0");
    this.maKeHoach = `KH-${dateCode}-${seq}`;
  }

  next();
});

module.exports = mongoose.model("ProductionPlan", ProductionPlanSchema);
