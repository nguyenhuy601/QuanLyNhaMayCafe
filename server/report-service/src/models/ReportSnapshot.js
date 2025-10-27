const mongoose = require("mongoose");

const ReportSnapshotSchema = new mongoose.Schema(
  {
    ngay: { type: Date, required: true },
    doanhThu: Number,
    soLuongSanXuat: Number,
    soLuongDatQC: Number,
    soLuongLoi: Number,
    tonKhoTP: Number,
    tonKhoNVL: Number,
    tongNhanVien: Number,
    tongChiLuong: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReportSnapshot", ReportSnapshotSchema);
