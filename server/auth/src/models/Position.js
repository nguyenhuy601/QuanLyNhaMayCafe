const mongoose = require("mongoose");
 
/**
 * Position - Chức vụ
 */
const PositionSchema = new mongoose.Schema({
  maCV: { type: String, required: true, unique: true },
  tenCV: { type: String, required: true },
  moTa: String,
  heSoLuong: { type: Number, default: 1.0 }, // dùng để tính lương
}, { timestamps: true });

module.exports = mongoose.model("Position", PositionSchema);