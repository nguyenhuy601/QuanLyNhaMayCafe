const mongoose = require("mongoose");

/**
 * FinishedIssue - Phiếu xuất kho thành phẩm
 * - Dùng khi giao hàng cho khách hoặc điều chuyển giữa các kho.
 * - Liên kết với đơn đặt hàng (Order) và sản phẩm (Product).
 */
const FinishedIssueSchema = new mongoose.Schema({
  maPhieuXuatTP: { type: String, required: true, unique: true },
  ngayXuat: { type: Date, default: Date.now },
  khoXuat: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  donHang: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // nếu xuất giao khách
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  nguoiNhan: String, // tên khách hàng hoặc kho nhận
  loaiXuat: { 
    type: String, 
    enum: ["GiaoKhachHang", "DieuChuyenKho", "Khac"], 
    default: "GiaoKhachHang" 
  },
  chiTiet: [
    {
      sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      soLuong: Number,
      donGia: Number,
      loXuat: String
    }
  ],
  tongTien: Number,
  ghiChu: String,
  trangThai: { 
    type: String, 
    enum: ["Cho xuat", "Da xuat", "Da giao"], 
    default: "Da xuat" 
  }
}, { timestamps: true });

module.exports = mongoose.model("FinishedIssue", FinishedIssueSchema);