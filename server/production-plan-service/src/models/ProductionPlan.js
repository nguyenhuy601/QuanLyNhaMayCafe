const mongoose = require("mongoose");

/**
 * ProductionPlan - Production Planning Document
 */
const ProductionPlanSchema = new mongoose.Schema(
  {
    maKeHoach: { type: String, unique: true },
    donHangLienQuan: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    sanPham: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    soLuongCanSanXuat: Number,
    ngayBatDauDuKien: Date,
    ngayKetThucDuKien: Date,
    xuongPhuTrach: String,
    nguoiLap: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    ngayLap: { type: Date, default: Date.now },
    trangThai: {
      type: String,
      enum: ["Chua duyet", "Da duyet", "Dang thuc hien", "Hoan thanh"],
      default: "Chua duyet",
    },
    nvlCanThiet: [
      {
        nvl: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        soLuong: Number,
      },
    ],
    ghiChu: String,
  },
  { timestamps: true }
);

/**
 * Auto-generate maKeHoach before save
 * Format: KH-YYYYMMDD-XXX
 */
ProductionPlanSchema.pre("save", async function (next) {
  if (!this.maKeHoach) {
    const today = new Date();
    const dateCode = today
      .toISOString()
      .split("T")[0]
      .replace(/-/g, ""); // YYYYMMDD

    const count = await mongoose.model("ProductionPlan").countDocuments({
      createdAt: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    });

    const seq = (count + 1).toString().padStart(3, "0");
    this.maKeHoach = `KH-${dateCode}-${seq}`;
  }

  next();
});

module.exports = mongoose.model("ProductionPlan", ProductionPlanSchema);
