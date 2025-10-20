const mongoose = require("mongoose");

/**
 * Attendance - Chấm công
 * - Tổ trưởng/chấm công tự động hoặc thủ công
 * - theo báo cáo: giờ vào, giờ ra, trạng thái (đi làm, nghỉ, tăng ca...)
 */
const AttendanceSchema = new mongoose.Schema({
  nhanVien: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  ngay: { type: Date, required: true },
  ca: { type: mongoose.Schema.Types.ObjectId, ref: "WorkShift" },
  to: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  gioVao: String,
  gioRa: String,
  trangThai: { 
    type: String, 
    enum: ["Đi làm","Nghỉ phép","Nghỉ không phép","Đi muộn","Tăng ca"], 
    default: "Đi làm" 
  },
  ghiChu: String,
  nguoiChamCong: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // tổ trưởng
}, { timestamps: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);