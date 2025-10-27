const ReportSnapshot = require("../models/ReportSnapshot");

/**
 * Tổng hợp dữ liệu theo event (mô phỏng BI real-time)
 */
exports.aggregateEventData = async (event, payload) => {
  const today = new Date().toISOString().split("T")[0];
  let snapshot = await ReportSnapshot.findOne({ ngay: today });
  if (!snapshot) snapshot = await ReportSnapshot.create({ ngay: today });

  switch (event) {
    case "ORDER_COMPLETED":
      snapshot.doanhThu = (snapshot.doanhThu || 0) + payload.tongTien;
      break;
    case "PRODUCTION_DONE":
      snapshot.soLuongSanXuat = (snapshot.soLuongSanXuat || 0) + payload.soLuongHoanThanh;
      break;
    case "QC_PASSED":
      snapshot.soLuongDatQC = (snapshot.soLuongDatQC || 0) + payload.soLuongDat;
      snapshot.soLuongLoi = (snapshot.soLuongLoi || 0) + payload.soLuongLoi;
      break;
    case "INVENTORY_UPDATE":
      snapshot.tonKhoTP = payload.tonKhoTP;
      snapshot.tonKhoNVL = payload.tonKhoNVL;
      break;
    case "PAYROLL_PROCESSED":
      snapshot.tongNhanVien = payload.soNhanVien;
      snapshot.tongChiLuong = (snapshot.tongChiLuong || 0) + payload.tongLuong;
      break;
    default:
      console.log("ℹ️ Event không xử lý:", event);
  }

  await snapshot.save();
  console.log("📊 Snapshot updated:", snapshot.ngay);
};
