const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    maNV: { type: String, required: true, unique: true, trim: true },
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

module.exports = mongoose.model("User", UserSchema);
