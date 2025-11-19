const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema(
  {
    maPhong: { type: String, required: true, unique: true, trim: true },
    tenPhong: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", DepartmentSchema);

