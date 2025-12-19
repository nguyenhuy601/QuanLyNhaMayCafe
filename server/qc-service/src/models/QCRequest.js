const mongoose = require("mongoose");

const QCRequestSchema = new mongoose.Schema(
  {
    maPhieuQC: { type: String, required: true, unique: true },
    // Lưu thông tin kế hoạch dưới dạng plain object (không ref vì cross-service)
    keHoach: {
      planId: String, // ID kế hoạch
      maKeHoach: String, // Mã kế hoạch
      sanPham: {
        productId: String,
        tenSanPham: String,
        maSP: String,
      },
    },
    sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    // Tên sản phẩm hiển thị (dùng khi không có sanPham ref hoặc chỉ là mô phỏng)
    sanPhamName: { type: String },
    loSanXuat: String,
    soLuong: Number,
    xuong: String,
    ngayYeuCau: { type: Date, default: Date.now },
    nguoiYeuCau: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    // Trạng thái luồng duyệt phiếu:
    // - "Cho duyet xuong": tổ trưởng tạo, chờ xưởng trưởng duyệt
    // - "Cho QC": xưởng trưởng đã duyệt, chờ QC kiểm định
    // - "Chưa kiểm định"/"Chờ kiểm tra": dùng cho dữ liệu/event cũ
    // - "Đã kiểm định": QC đã hoàn tất
    trangThai: {
      type: String,
      enum: [
        "Cho duyet xuong",
        "Cho QC",
        "Chưa kiểm định",
        "Chờ kiểm tra",
        "Đã kiểm định",
        "Tu choi",
      ],
      default: "Cho duyet xuong",
    },
    ghiChu: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("QCRequest", QCRequestSchema);
