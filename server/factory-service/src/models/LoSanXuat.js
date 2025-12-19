const mongoose = require("mongoose");

/**
 * LoSanXuat (Lô sản xuất) - Quản lý lô thành phẩm sau khi tổ dán nhãn hoàn thành
 */
const LoSanXuatSchema = new mongoose.Schema(
  {
    maLo: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      index: true,
    },
    // Thông tin sản phẩm (cache từ kế hoạch hoặc tổ)
    sanPham: {
      productId: String, // ID từ Product service
      maSP: String,
      tenSanPham: String,
      loai: String, // hat, rangxay, hoatan
    },
    // Nhóm sản phẩm
    nhomSanPham: {
      type: String,
      enum: ["hat", "rangxay", "hoatan", "khac"],
      default: "khac",
      index: true,
    },
    // Nguyên liệu
    nguyenLieu: {
      type: String,
      enum: ["arabica", "robusta", "chon", ""],
      default: "",
      index: true,
    },
    // Số lượng sản phẩm trong lô
    soLuong: {
      type: Number,
      required: true,
      default: 0,
    },
    // Ngày sản xuất
    ngaySanXuat: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Hạn sử dụng (mặc định 2 năm sau ngày sản xuất)
    hanSuDung: {
      type: Date,
      required: true,
    },
    // Thông tin xưởng (cache)
    xuong: {
      id: String,
      tenXuong: String,
    },
    // Thông tin tổ sản xuất (cache)
    toSanXuat: {
      id: String,
      maTo: String,
      tenTo: String,
    },
    // Kế hoạch sản xuất (nếu có)
    keHoach: {
      planId: String,
      maKeHoach: String,
    },
    // Người tạo lô (thường là hệ thống tự động)
    nguoiTao: {
      id: String,
      hoTen: String,
      email: String,
    },
    // Trạng thái lô
    trangThai: {
      type: String,
      enum: ["Da tao", "Cho QC", "Da QC", "Da nhap kho", "Da xuat kho", "Hoan thanh"],
      default: "Da tao",
      index: true,
    },
    // Phiếu QC (nếu đã có)
    phieuQC: {
      type: String, // ID phiếu QC
    },
    // Phiếu nhập kho (nếu đã nhập)
    phieuNhapKho: {
      type: String, // ID phiếu nhập kho
    },
    // Ghi chú
    ghiChu: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Index để tìm nhanh
LoSanXuatSchema.index({ maLo: 1 });
LoSanXuatSchema.index({ "sanPham.productId": 1 });
LoSanXuatSchema.index({ nhomSanPham: 1, nguyenLieu: 1 });
LoSanXuatSchema.index({ trangThai: 1 });
LoSanXuatSchema.index({ ngaySanXuat: 1 });

// Auto-generate mã lô trước khi validation (để tránh lỗi required)
LoSanXuatSchema.pre("validate", function (next) {
  if (!this.maLo) {
    // Tạo mã lô tự động: LO-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maLo = `LO-${dateStr}-${randomCode}`;
  }
  next();
});

// Auto-set hạn sử dụng và trạng thái mặc định khi save
LoSanXuatSchema.pre("save", function (next) {
  // Tự động set hạn sử dụng là 2 năm sau ngày sản xuất nếu chưa có
  if (!this.hanSuDung && this.ngaySanXuat) {
    const expiryDate = new Date(this.ngaySanXuat);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2);
    this.hanSuDung = expiryDate;
  }
  
  // Tự động set trạng thái mặc định cho các lô cũ không có trạng thái
  if (!this.trangThai || !["Da tao", "Cho QC", "Da QC", "Da nhap kho", "Da xuat kho", "Hoan thanh"].includes(this.trangThai)) {
    // Xác định trạng thái dựa trên dữ liệu hiện có
    if (this.phieuNhapKho) {
      // Nếu đã có phiếu nhập kho, có thể là "Hoàn thành" hoặc "Đã nhập kho"
      this.trangThai = "Hoan thanh";
    } else if (this.phieuQC) {
      // Nếu đã có phiếu QC, kiểm tra xem đã QC chưa
      // Nếu có thể xác định từ dữ liệu khác, nhưng tạm thời set "Da QC"
      this.trangThai = "Da QC";
    } else {
      // Mặc định là "Da tao"
      this.trangThai = "Da tao";
    }
    console.log(`🔄 [LoSanXuat] Tự động set trạng thái "${this.trangThai}" cho lô ${this.maLo || this._id}`);
  }
  
  next();
});

module.exports = mongoose.model("LoSanXuat", LoSanXuatSchema);

