const mongoose = require("mongoose");

/**
 * WorkAssignment - Phân công công việc (Xưởng trưởng lập)
 */
const WorkAssignmentSchema = new mongoose.Schema({
  maPhanCong: { type: String, required: true, unique: true, index: true },
  xuong: { type: mongoose.Schema.Types.ObjectId, ref: "Workshop", required: true },
  keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
  ngay: { type: Date, required: true },
  congViec: [
    {
      to: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
      moTa: String,
      soLuong: Number,
      thoiGianBatDau: String,
      thoiGianKetThuc: String
    }
  ],
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  trangThai: { type: String, enum: ["Luu nhap","Phat hanh","Hoan thanh"], default: "Luu nhap" }
}, { timestamps: true });

module.exports = mongoose.model("WorkAssignment", WorkAssignmentSchema);
