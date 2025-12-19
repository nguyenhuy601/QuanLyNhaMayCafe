const mongoose = require("mongoose");

/**
 * XuongSanXuat (Xưởng sản xuất) - Quản lý các xưởng sản xuất
 */
const XuongSanXuatSchema = new mongoose.Schema(
  {
    maXuong: { 
      type: String, 
      unique: true, 
      trim: true,
      index: true 
      // Không required - sẽ tự động tạo trong pre-save hook
    },
    tenXuong: { 
      type: String, 
      required: true, 
      trim: true 
    },
    // Sản phẩm phụ trách (mỗi xưởng chỉ phụ trách 1 sản phẩm)
    sanPhamPhuTrach: {
      productId: String, // ID từ Product service
      maSP: String,
      tenSP: String,
    },
    // Xưởng trưởng (lưu dạng cache object, không reference)
    xuongTruong: [
      {
        id: String, // ID từ Account service
        hoTen: String,
        email: String,
        role: String,
      },
    ],
    // Danh sách tổ sản xuất thuộc xưởng này
    danhSachTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ToSanXuat",
      },
    ],
    // Danh sách thành viên (công nhân) trong xưởng (tổng hợp từ các tổ)
    thanhVien: [
      {
        id: String, // ID từ User service
        hoTen: String,
        email: String,
        role: String,
        maNV: String,
      },
    ],
    // Tổ trưởng chính của xưởng (mỗi xưởng chỉ có 1 tổ trưởng)
    toTruong: {
      id: String, // ID từ Account/User service
      hoTen: String,
      email: String,
      role: String,
      maNV: String,
      tenTo: String, // Tên tổ mà tổ trưởng này phụ trách
      maTo: String, // Mã tổ
    },
    moTa: { 
      type: String, 
      default: "" 
    },
    trangThai: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

// Index để tìm nhanh
XuongSanXuatSchema.index({ maXuong: 1 });
XuongSanXuatSchema.index({ trangThai: 1 });

// Auto-generate mã xưởng nếu chưa có (cho trường hợp create đơn lẻ)
XuongSanXuatSchema.pre("save", function (next) {
  if (!this.maXuong) {
    // Tạo mã xưởng tự động: XUONG-TIMESTAMP-RANDOM
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
    this.maXuong = `XUONG-${timestamp}-${randomCode}`;
  }
  next();
});

module.exports = mongoose.model("XuongSanXuat", XuongSanXuatSchema);

