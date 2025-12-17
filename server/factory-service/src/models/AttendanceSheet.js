const mongoose = require("mongoose");

const AttendanceEntrySchema = new mongoose.Schema(
  {
    workerId: String,
    maCongNhan: { type: String, required: true },
    hoTen: String,
    caLam: { type: String, default: "ca_sang" },
    trangThai: {
      type: String,
      enum: ["co_mat", "vang", "tre", "nghi_phep"],
      default: "co_mat",
    },
    ghiChu: String,
    isOvertime: {
      type: Boolean,
      default: false,
    },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const AttendanceSheetSchema = new mongoose.Schema(
  {
    maBang: { type: String, unique: true },
    ngay: { type: Date, required: true },
    caLam: { type: String, default: "ca_sang" },
    toSanXuat: {
      id: String,
      tenTo: String,
    },
    nguoiTao: {
      id: String,
      hoTen: String,
    },
    trangThaiBang: {
      type: String,
      enum: ["draft", "saved", "submitted"],
      default: "draft",
    },
    ghiChuChung: String,
    entries: [AttendanceEntrySchema],
  },
  { timestamps: true }
);

AttendanceSheetSchema.index({ ngay: 1, caLam: 1, "toSanXuat.id": 1 }, { unique: true });

AttendanceSheetSchema.pre("save", function (next) {
  if (!this.maBang) {
    const stamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    this.maBang = `CC-${stamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("AttendanceSheet", AttendanceSheetSchema);

