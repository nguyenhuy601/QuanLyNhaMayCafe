const mongoose = require("mongoose");

/**
 * CaLamViec (Ca làm việc) - Quản lý các ca làm việc trong xưởng
 */
const CaLamViecSchema = new mongoose.Schema(
  {
    maCa: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true,
      index: true 
    },
    tenCa: { 
      type: String, 
      required: true, 
      trim: true 
    },
    gioBatDau: { 
      type: String, 
      required: true,
      // Format: "HH:mm" ví dụ "08:00"
    },
    gioKetThuc: { 
      type: String, 
      required: true,
      // Format: "HH:mm" ví dụ "17:00"
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
CaLamViecSchema.index({ maCa: 1 });
CaLamViecSchema.index({ trangThai: 1 });

// Auto-generate mã ca nếu chưa có
CaLamViecSchema.pre("save", function (next) {
  if (!this.maCa) {
    // Tạo mã ca tự động: CA-XXXX
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maCa = `CA-${randomCode}`;
  }
  next();
});

module.exports = mongoose.model("CaLamViec", CaLamViecSchema);

