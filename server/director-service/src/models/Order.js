const mongoose = require("mongoose");

/**
 * Order - Đơn đặt hàng (nhân viên bán hàng tạo)
 */
const OrderSchema = new mongoose.Schema({
  maDH: { type: String, required: true, unique: true },
  khachHang: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  nguoiTao: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  ngayDat: { type: Date, default: Date.now },
  ngayYeuCauGiao: Date,
  diaChiGiao: String,
  trangThai: { type: String, enum: ["Dang cho duyet","Da duyet","Tu choi","Da xuat"], default: "Dang cho duyet" },
  chiTiet: [
    {
      sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      soLuong: Number,
      donGia: Number,
      thanhTien: Number
    }
  ],
  tongTien: Number,
  ghiChu: String
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);