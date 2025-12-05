const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    // Mã phòng ban - tự sinh, không bắt buộc nhập
    maPhong: { type: String, unique: true, trim: true },
    tenPhong: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
  },
  { timestamps: true }
);

// Tự động sinh maPhong nếu chưa có
DepartmentSchema.pre("save", function (next) {
  if (!this.maPhong) {
    const prefix = "PB";
    const slug =
      this.tenPhong
        ?.toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase() || "AUTO";
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maPhong = `${prefix}_${slug}_${rand}`;
  }
  next();
});

module.exports = mongoose.model("Department", DepartmentSchema);

