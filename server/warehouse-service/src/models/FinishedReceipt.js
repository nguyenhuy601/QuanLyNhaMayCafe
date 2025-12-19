const mongoose = require("mongoose");

/**
 * FinishedReceipt - Phiếu nhập thành phẩm (sau QC đạt)
 */
const FinishedReceiptSchema = new mongoose.Schema({
 maPhieuNhapTP: { type: String, required: true, unique: true, index: true },
 phieuQC: { type: String }, // Lưu ID dạng string, không ref vì có thể là service khác
 sanPhamName: { type: String, required: true }, // Lưu tên sản phẩm thay vì ID
 soLuong: { type: Number, default: 0 },
 loSanXuat: String,
 ngaySanXuat: Date,
 hanSuDung: Date,
 nguoiLap: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 ngayNhap: { type: Date, default: Date.now },
 khoLuuTru: String, // Kho lưu trữ (KHA, KHB, KHC)
 ghiChu: String,
 // Trạng thái phiếu nhập thành phẩm
 trangThai: {
   type: String,
   enum: ["Cho duyet", "Da duyet", "Da nhap kho", "Da huy"],
   default: "Cho duyet", // Mặc định là chờ duyệt khi xưởng trưởng tạo
   index: true
 }
}, { timestamps: true });

// Auto-set trạng thái mặc định cho các phiếu cũ không có trạng thái
FinishedReceiptSchema.pre("save", function (next) {
  if (!this.trangThai || !["Cho duyet", "Da duyet", "Da nhap kho", "Da huy"].includes(this.trangThai)) {
    this.trangThai = "Cho duyet"; // Mặc định chờ duyệt
    console.log(`🔄 [FinishedReceipt] Tự động set trạng thái "${this.trangThai}" cho phiếu ${this.maPhieuNhapTP || this._id}`);
  }
  next();
});

module.exports = mongoose.model("FinishedReceipt", FinishedReceiptSchema);