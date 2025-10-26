const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    maNV: { type: String, required: true, unique: true },
    hoTen: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    soDienThoai: String,
    chucVu: String,
    phongBan: String,
    role: { type: String, enum: ["Admin", "Director", "Sales", "Factory", "QC", "HR", "Warehouse"], required: true },
    trangThai: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
