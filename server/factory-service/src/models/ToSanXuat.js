const mongoose = require("mongoose");

/**
 * ToSanXuat (Tổ sản xuất) - Quản lý các tổ sản xuất trong xưởng
 */
const ToSanXuatSchema = new mongoose.Schema(
  {
    maTo: { 
      type: String, 
      unique: true, 
      trim: true,
      index: true 
      // Không required - sẽ tự động tạo trong pre-save hook
    },
    tenTo: { 
      type: String, 
      required: true, 
      trim: true 
    },
    // Danh sách tổ trưởng (lưu dạng cache object, không reference)
    toTruong: [
      {
        id: String, // ID từ Account/User service
        hoTen: String,
        email: String,
        role: String,
        maNV: String,
      },
    ],
    // Danh sách thành viên trong tổ (lưu dạng cache object, không reference)
    thanhVien: [
      {
        id: String, // ID từ Account/User service
        hoTen: String,
        email: String,
        role: String,
        maNV: String,
        hoanThanh: { // Trạng thái hoàn thành do tổ trưởng xác nhận
          type: Boolean,
          default: false,
        },
        ngayXacNhan: Date, // Ngày tổ trưởng xác nhận hoàn thành
      },
    ],
    moTa: { 
      type: String, 
      default: "" 
    },
    // Xưởng mà tổ này thuộc về
    xuong: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Xuong", // Có thể tạo model Xuong sau, hoặc dùng string
    },
    // Thông tin xưởng dạng cache (nếu không có model Xuong)
    xuongInfo: {
      id: String,
      tenXuong: String,
    },
    // Nhóm sản phẩm mà tổ này phụ trách (để dễ lọc)
    // hat       - Cà phê hạt
    // rangxay   - Cà phê rang xay
    // hoatan    - Cà phê hòa tan
    nhomSanPham: {
      type: String,
      enum: ["hat", "rangxay", "hoatan", "khac"],
      default: "khac",
      index: true,
    },
    // Nguyên liệu mà tổ này xử lý (để dễ lọc)
    // arabica, robusta, chon, hoặc rỗng nếu không áp dụng
    nguyenLieu: {
      type: String,
      enum: ["arabica", "robusta", "chon", ""],
      default: "",
      index: true,
    },
    trangThai: {
      type: String,
      enum: ["Active", "Inactive", "Dang san xuat", "Nghi"],
      default: "Active",
      index: true,
    },
  },
  { timestamps: true }
);

// Index để tìm nhanh theo mã tổ và xưởng
ToSanXuatSchema.index({ maTo: 1 });
ToSanXuatSchema.index({ xuong: 1 });
ToSanXuatSchema.index({ "xuongInfo.id": 1 });
ToSanXuatSchema.index({ nhomSanPham: 1, nguyenLieu: 1 });

// Auto-generate mã tổ và tự động suy ra nhomSanPham, nguyenLieu từ xuongInfo
ToSanXuatSchema.pre("save", function (next) {
  if (!this.maTo) {
    // Tạo mã tổ tự động: TO-XXXX
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maTo = `TO-${randomCode}`;
  }
  
  // Tự động suy ra nhomSanPham và nguyenLieu từ xuongInfo.tenXuong nếu chưa có
  if (this.xuongInfo && this.xuongInfo.tenXuong && !this.nhomSanPham) {
    const tenXuong = (this.xuongInfo.tenXuong || "").toLowerCase();
    
    // Xác định nhomSanPham
    if (tenXuong.includes("hòa tan") || tenXuong.includes("hoa tan")) {
      this.nhomSanPham = "hoatan";
    } else if (tenXuong.includes("rang xay") || tenXuong.includes("rangxay") || 
               tenXuong.includes("arabica") || tenXuong.includes("robusta") || 
               tenXuong.includes("civet")) {
      this.nhomSanPham = "rangxay";
    } else {
      this.nhomSanPham = "khac";
    }
    
    // Xác định nguyenLieu
    if (tenXuong.includes("arabica")) {
      this.nguyenLieu = "arabica";
    } else if (tenXuong.includes("robusta")) {
      this.nguyenLieu = "robusta";
    } else if (tenXuong.includes("civet") || tenXuong.includes("chồn") || tenXuong.includes("chon")) {
      this.nguyenLieu = "chon";
    } else {
      this.nguyenLieu = "";
    }
  }
  
  next();
});

module.exports = mongoose.model("ToSanXuat", ToSanXuatSchema);

