const mongoose = require("mongoose");

/**
 * Position - Chức vụ (Xưởng trưởng, Tổ trưởng, Công nhân, QC, Kế hoạch, Kế toán, ...)
 */
const PositionSchema = new mongoose.Schema({
  maCV: { type: String, required: true, unique: true, index: true },
  tenCV: { type: String, required: true },
  moTa: String,
  heSoLuong: { type: Number, default: 1.0 } // dùng tính lương
}, { timestamps: true });

module.exports = mongoose.model("Position", PositionSchema);