const mongoose = require("mongoose");

/**
 * WorkShift - Ca làm việc
 * - mã ca, giờ bắt đầu/giờ kết thúc, mô tả
 */
const WorkShiftSchema = new mongoose.Schema({
  maCa: { type: String, required: true, unique: true },
  tenCa: { type: String, required: true }, // ví dụ: Ca sáng, Ca chiều, Ca đêm
  gioBatDau: String, // "07:00"
  gioKetThuc: String, // "15:00"
  moTa: String,
}, { timestamps: true });

module.exports = mongoose.model("WorkShift", WorkShiftSchema);