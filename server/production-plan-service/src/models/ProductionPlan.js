const mongoose = require("mongoose");
const Counter = require("./Counter");
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
    donVi: { type: String, enum: ["kg", "túi", null], default: null }, // Đơn vị sản phẩm
    soLuongNVLUocTinh: Number, // Số lượng NVL ước tính (hiển thị)
    soLuongNVLThucTe: Number, // Số lượng NVL thực tế đã tính (từ nvlCanThiet)
    soLuongNVLTho: Number, // Số lượng NVL thô (hạt cà phê) - tính bằng kg
    soLuongBaoBi: Number, // Số lượng bao bì - túi
    soLuongTemNhan: Number, // Số lượng tem nhãn
    ngayBatDauDuKien: Date,
    ngayKetThucDuKien: Date,
    xuongPhuTrach: String,
    nguoiLap: { type: String }, // Store user ID as string instead of ref
    ngayLap: { type: Date, default: Date.now },
    trangThai: {
      type: String,
      enum: ["Chờ duyệt", "Đã duyệt", "Đang thực hiện", "Hoàn thành", "Từ chối"],
      default: "Chờ duyệt",
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

ProductionPlanSchema.pre("save", async function (next) {
  if (this.maKeHoach) return next();

  const now = new Date();
  const dateCode = now.toISOString().split("T")[0].replace(/-/g, "");

  // Atomic update: tăng seq theo ngày
  const counter = await Counter.findOneAndUpdate(
    { date: dateCode },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const seq = counter.seq.toString().padStart(3, "0");
  this.maKeHoach = `KH-${dateCode}-${seq}`;

  next();
});


module.exports = mongoose.model("ProductionPlan", ProductionPlanSchema);
