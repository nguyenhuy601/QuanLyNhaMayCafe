const mongoose = require("mongoose");

/**
 * MaterialRequest - Phiếu yêu cầu bổ sung nguyên vật liệu
 */
const MaterialRequestSchema = new mongoose.Schema({
 maPhieu: { type: String, required: true, unique: true, index: true },
 keHoach: { type: mongoose.Schema.Types.ObjectId, ref: "ProductionPlan" },
 danhSachNVL: [
   { nvl: { type: mongoose.Schema.Types.ObjectId, ref: "Product" }, soLuong: Number, lyDo: String }
 ],
 trangThai: { type: String, enum: ["Cho phe duyet","Da duyet","Da dat hang","Hoan thanh","Tu choi"], default: "Cho phe duyet" },
 ngayYeuCau: { type: Date, default: Date.now },
 nguoiTao: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
}, { timestamps: true });

module.exports = mongoose.model("MaterialRequest", MaterialRequestSchema);