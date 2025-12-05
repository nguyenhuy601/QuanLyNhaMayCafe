const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema(
  {
    // Mã chức vụ - tự sinh, không bắt buộc nhập
    maChucVu: { type: String, unique: true, trim: true },
    tenChucVu: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
    bacLuongToiThieu: { type: Number, min: 0 },
    bacLuongToiDa: { type: Number, min: 0 },
  },
  { timestamps: true }
);

// Tự động sinh maChucVu nếu chưa có
PositionSchema.pre("save", function (next) {
  if (!this.maChucVu) {
    const prefix = "CV";
    const slug =
      this.tenChucVu
        ?.toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase() || "AUTO";
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maChucVu = `${prefix}_${slug}_${rand}`;
  }
  next();
});

module.exports = mongoose.model("Position", PositionSchema);

