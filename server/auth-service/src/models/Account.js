const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String,
    isActive: { type: Boolean, default: true },
    // Danh sách sản phẩm phụ trách (chỉ dành cho xưởng trưởng)
    // Chỉ lưu field này khi role là "xuongtruong"
    sanPhamPhuTrach: [
      {
        productId: String, // ID từ Product service
        maSP: String,
        tenSP: String,
      },
    ],
  },
  { timestamps: true }
);

// Pre-save hook: Tự động xóa sanPhamPhuTrach nếu role không phải xuongtruong
AccountSchema.pre("save", function (next) {
  if (this.role !== "xuongtruong") {
    // Nếu role không phải xưởng trưởng, xóa field này
    if (this.sanPhamPhuTrach && this.sanPhamPhuTrach.length > 0) {
      this.sanPhamPhuTrach = undefined;
    }
  }
  next();
});

// Pre-update hook: Tự động xóa sanPhamPhuTrach khi update nếu role không phải xuongtruong
AccountSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function (next) {
  const update = this.getUpdate();
  if (update && update.role && update.role !== "xuongtruong") {
    update.$unset = update.$unset || {};
    update.$unset.sanPhamPhuTrach = "";
  }
  next();
});

module.exports = mongoose.model("Account", AccountSchema);
