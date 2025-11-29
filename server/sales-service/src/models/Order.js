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
      donVi: { 
        type: String, 
        enum: ["kg", "túi"], 
        default: null,
        required: false // Không bắt buộc để tương thích với dữ liệu cũ
      },
      loaiTui: { 
        type: String, 
        enum: ["500g", "1kg", "hop", null], 
        default: null,
        required: false // Loại túi: "500g", "1kg" cho túi bạc, "hop" cho hộp (sản phẩm hòa tan)
      },
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
  
  // Calculate tongTien và validate donVi
  if (this.chiTiet && this.chiTiet.length > 0) {
    this.tongTien = this.chiTiet.reduce((total, item) => {
      item.thanhTien = item.soLuong * item.donGia;
      // Validate donVi chỉ khi có giá trị (cho phép null cho dữ liệu cũ)
      if (item.donVi !== null && item.donVi !== undefined && !["kg", "túi"].includes(item.donVi)) {
        return next(new Error(`Đơn vị không hợp lệ: ${item.donVi}. Chỉ chấp nhận "kg" hoặc "túi"`));
      }
      return total + item.thanhTien;
    }, 0);
  }
  
  next();
});

module.exports = mongoose.model("Order", OrderSchema);