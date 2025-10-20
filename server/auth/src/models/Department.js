const mongoose = require("mongoose");

/**
 * Department - Phòng ban
 */
const DepartmentSchema = new mongoose.Schema({
  maPB: { type: String, required: true, unique: true },
  tenPB: { type: String, required: true },
  moTa: String,
  truongPhong: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // xưởng trưởng/quản lý phòng
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);