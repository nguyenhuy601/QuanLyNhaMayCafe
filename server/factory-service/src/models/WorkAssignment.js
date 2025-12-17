const mongoose = require("mongoose");

/**
 * WorkAssignment - Phân công công việc (Xưởng trưởng lập)
 * Lưu cache dữ liệu cross-service dưới dạng plain object thay vì ObjectId ref
 */
const WorkAssignmentSchema = new mongoose.Schema(
  {
    maPhanCong: { type: String, required: true, unique: true, index: true },
    keHoach: {
      planId: String,
      maKeHoach: String,
      soLuongCanSanXuat: Number,
      soLuongNVLUocTinh: Number,
      ngayBatDauDuKien: Date,
      ngayKetThucDuKien: Date,
      sanPham: {
        productId: String,
        tenSanPham: String,
        maSP: String,
        loai: String,
      },
    },
    xuong: {
      id: String,
      tenXuong: String,
      ghiChu: String,
    },
    ngay: { type: Date, required: true },
    caLam: {
      id: String,
      tenCa: String,
      gioBatDau: String,
      gioKetThuc: String,
    },
    congViec: [
      {
        to: {
          id: String,
          tenTo: String,
        },
        moTa: String,
        soLuong: Number,
        thoiGianBatDau: String,
        thoiGianKetThuc: String,
      },
    ],
    // Danh sách nhân sự tham gia phân công (dùng cho tổ trưởng phân ca)
    nhanSu: [
      {
        id: String,
        hoTen: String,
        email: String,
        maNV: String,
        role: String,
      },
    ],
    nguoiLap: {
      id: String,
      hoTen: String,
      position: String,
    },
    trangThai: {
      type: String,
      enum: ["Luu nhap", "Dang thuc hien", "Cho xac nhan", "Hoan thanh"],
      default: "Luu nhap",
    },
    ghiChu: String,
  },
  { timestamps: true }
);

WorkAssignmentSchema.pre("validate", function (next) {
  if (!this.maPhanCong) {
    const stamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    this.maPhanCong = `PC-${stamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  if (!this.ngay) {
    this.ngay = new Date();
  }
  next();
});

module.exports = mongoose.model("WorkAssignment", WorkAssignmentSchema);
