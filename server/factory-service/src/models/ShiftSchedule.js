const mongoose = require("mongoose");

const ShiftMemberSchema = new mongoose.Schema(
  {
    workerId: String,
    maCongNhan: { type: String, required: true },
    hoTen: String,
    nhiemVu: String,
    trangThai: {
      type: String,
      enum: ["scheduled", "in_progress", "completed"],
      default: "scheduled",
    },
    ghiChu: String,
  },
  { _id: true }
);

const ShiftScheduleSchema = new mongoose.Schema(
  {
    maLich: { type: String, unique: true },
    ngay: { type: Date, required: true },
    caLam: { type: String, required: true },
    toSanXuat: {
      id: String,
      tenTo: String,
    },
    nguoiLap: {
      id: String,
      hoTen: String,
    },
    members: [ShiftMemberSchema],
    ghiChu: String,
    trangThai: {
      type: String,
      enum: ["draft", "approved"],
      default: "draft",
    },
  },
  { timestamps: true }
);

ShiftScheduleSchema.index({ ngay: 1, caLam: 1, "toSanXuat.id": 1 }, { unique: true });

ShiftScheduleSchema.pre("save", function (next) {
  if (!this.maLich) {
    const stamp = new Date().toISOString().split("T")[0].replace(/-/g, "");
    this.maLich = `PC-${stamp}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("ShiftSchedule", ShiftScheduleSchema);

