const mongoose = require("mongoose");

/**
 * MaterialRequest - Phiếu yêu cầu bổ sung nguyên vật liệu
 */
const MaterialRequestSchema = new mongoose.Schema({
 maPhieu: { type: String, unique: true },
 keHoach: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 danhSachNVL: [
   { 
     nvl: { type: String }, // Lưu ID dạng string, không ref vì là service khác
     soLuong: Number, 
     lyDo: String 
   }
 ],
 trangThai: {
   type: String,
   enum: ["Chờ phê duyệt", "Đã duyệt", "Đã đặt hàng", "Hoàn thành", "Từ chối"],
   default: "Chờ phê duyệt",
 },
 ngayYeuCau: { type: Date, default: Date.now },
 nguoiTao: { type: String }, // Lưu ID dạng string, không ref vì là service khác
 nguoiDuyet: { type: String }, // Người duyệt (Director)
 ngayDuyet: { type: Date }, // Ngày duyệt
 ghiChu: { type: String }, // Lý do từ chối hoặc ghi chú
}, { timestamps: true });

// Tự sinh mã phiếu
MaterialRequestSchema.pre("save", async function (next) {
  if (this.maPhieu) return next();
  
  try {
    const last = await mongoose.model("MaterialRequest")
      .findOne({})
      .sort({ createdAt: -1 })
      .select("maPhieu");
    
    let nextNumber = 1;
    if (last && last.maPhieu) {
      const match = last.maPhieu.match(/\d+$/);
      if (match) nextNumber = parseInt(match[0], 10) + 1;
    }
    
    this.maPhieu = `MR-${nextNumber.toString().padStart(4, "0")}`;
    next();
  } catch (err) {
    console.error("❌ Lỗi khi tự sinh mã phiếu:", err);
    next(err);
  }
});

module.exports = mongoose.model("MaterialRequest", MaterialRequestSchema);