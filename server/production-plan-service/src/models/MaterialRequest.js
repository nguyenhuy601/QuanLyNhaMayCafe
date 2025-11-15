const mongoose = require("mongoose");

/**
 * MaterialRequest - Phiếu bổ sung nguyên vật liệu
 */
const MaterialRequestSchema = new mongoose.Schema(
  {
    maPhieu: { type: String, unique: true },
    keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
    danhSachNVL: [
      {
        nvl: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        soLuong: Number,
        lyDo: String,
      },
    ],
    trangThai: {
      type: String,
      enum: ["Cho phe duyet", "Da duyet", "Da dat hang", "Hoan thanh", "Tu choi"],
      default: "Cho phe duyet",
    },
    ngayYeuCau: { type: Date, default: Date.now },
    nguoiTao: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

/**
 * 🧩 Tự sinh mã phiếu (maPhieu) theo dạng: MR-0001, MR-0002, ...
 */
MaterialRequestSchema.pre("save", async function (next) {
  if (this.maPhieu) return next(); // Đã có mã → bỏ qua

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
