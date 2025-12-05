const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    maNV: { type: String, unique: true, trim: true, index: true },
    hoTen: { type: String, required: true, trim: true },
    gioiTinh: {
      type: String,
      enum: ["Nam", "Nữ", "Khác"],
      default: "Khác",
    },
    ngaySinh: { type: Date },
    diaChi: { type: String, trim: true },
    sdt: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ngayVaoLam: { type: Date },
    role: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    chucVu: [{ type: Schema.Types.ObjectId, ref: "Position" }],
    phongBan: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    luongCoBan: { type: Number, min: 0 },
    trangThai: {
      type: String,
      enum: ["Active", "Inactive", "OnLeave"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Tự sinh mã nhân viên nếu chưa có
UserSchema.pre("save", async function (next) {
  if (!this.maNV) {
    // Tạo slug từ họ tên
    const slug = (this.hoTen || "NV")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "")
      .toUpperCase()
      .substring(0, 6) || "NV";
    
    // Thêm random string để đảm bảo unique
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maNV = `NV_${slug}_${rand}`;
  }
  next();
});

module.exports = mongoose.model("User", UserSchema);
