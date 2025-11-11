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
  trangThai: { type: String, enum: ["Chờ duyệt", "Đã duyệt", "Đang giao", "Hoàn thành", "Đã hủy"], default: "Chờ duyệt" },
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

// Pre-save hook to generate maDH if not provided
OrderSchema.pre('save', async function(next) {
  if (!this.maDH) {
    const latestOrder = await this.constructor.findOne().sort({ maDH: -1 });
    const nextNumber = latestOrder 
      ? parseInt(latestOrder.maDH.replace('DH', '')) + 1 
      : 1;
    this.maDH = `DH${String(nextNumber).padStart(3, '0')}`;
  }
  
  // Calculate tongTien
  if (this.chiTiet && this.chiTiet.length > 0) {
    this.tongTien = this.chiTiet.reduce((total, item) => {
      item.thanhTien = item.soLuong * item.donGia;
      return total + item.thanhTien;
    }, 0);
  }
  
  next();
});

module.exports = mongoose.model("Order", OrderSchema);