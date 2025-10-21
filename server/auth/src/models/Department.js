const mongoose = require("mongoose");

/**
 * Department - Phòng ban hành chính
 */
const DepartmentSchema = new mongoose.Schema({
  maPB: { type: String, required: true, unique: true, index: true },
  tenPB: { type: String, required: true },
  moTa: String,
  truongPhong: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" } // ref employee
}, { timestamps: true });

module.exports = mongoose.model("Department", DepartmentSchema);