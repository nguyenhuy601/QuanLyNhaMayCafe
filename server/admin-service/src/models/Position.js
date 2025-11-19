const mongoose = require("mongoose");

const PositionSchema = new mongoose.Schema(
  {
    maChucVu: { type: String, required: true, unique: true, trim: true },
    tenChucVu: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
    bacLuongToiThieu: { type: Number, min: 0 },
    bacLuongToiDa: { type: Number, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Position", PositionSchema);

