const mongoose = require("mongoose");

/**
 * WorkAssignment - Bảng phân công công việc cho tổ/ca
 * - Ghi rõ: tổ, ca, công việc, số nhân viên, thời gian, xưởng
 */
const WorkAssignmentSchema = new mongoose.Schema({
  maPhanCong: { type: String, required: true, unique: true },
  ngay: { type: Date, required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  ca: { type: mongoose.Schema.Types.ObjectId, ref: "WorkShift" },
  xuong: String, // tên xưởng/line nếu cần
  congViec: [
    {
      tenCongViec: String, // mô tả công việc
      soLuongNhanVien: Number,
      listNhanVien: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }]
    }
  ],
  nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // xưởng trưởng/hoặc tổ trưởng lập
  trangThai: { type: String, enum: ["Lưu nháp","Phát hành","Hoàn thành"], default: "Lưu nháp" }
}, { timestamps: true });

module.exports = mongoose.model("WorkAssignment", WorkAssignmentSchema);