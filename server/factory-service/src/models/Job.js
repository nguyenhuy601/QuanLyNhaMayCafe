const mongoose = require("mongoose");

/**
 * Job (Công việc) - Danh sách công việc chi tiết trong xưởng
 */
const JobSchema = new mongoose.Schema(
  {
    tenCongViec: { type: String, required: true, trim: true },
    soLuongNhanVien: { type: Number, default: 0 },
    // Danh sách nhân viên tham gia công việc - lưu ObjectId để có thể map sang Employee ở service khác
    listNhanVien: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    // Nhóm sản phẩm áp dụng cho công việc này
    // hat       - Cà phê hạt
    // rangxay   - Cà phê rang xay
    // hoatan    - Cà phê hòa tan
    nhomSanPham: {
      type: String,
      enum: ["hat", "rangxay", "hoatan"],
      default: "hat",
    },
    // Tổ / bộ phận phụ trách công việc
    to: {
      type: mongoose.Schema.Types.ObjectId,
    },
    moTa: { type: String, default: "" },
    thoiGianBatDau: { type: Date },
    thoiGianKetThuc: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);


