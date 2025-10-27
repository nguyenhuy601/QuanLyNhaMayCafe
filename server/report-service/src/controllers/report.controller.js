const ReportSnapshot = require("../models/ReportSnapshot");

/** Lấy báo cáo theo ngày */
exports.getReportByDate = async (req, res) => {
  try {
    const report = await ReportSnapshot.findOne({ ngay: req.params.date });
    if (!report) return res.status(404).json({ message: "Không có dữ liệu ngày này" });
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy báo cáo tổng hợp gần nhất */
exports.getLatestReport = async (req, res) => {
  try {
    const latest = await ReportSnapshot.findOne().sort({ ngay: -1 });
    res.status(200).json(latest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Lấy thống kê theo tháng (group by) */
exports.getMonthlySummary = async (req, res) => {
  try {
    const month = req.params.month; // format: "2025-10"
    const regex = new RegExp(`^${month}`);
    const data = await ReportSnapshot.find({ ngay: { $regex: regex } });

    const summary = data.reduce(
      (acc, r) => ({
        doanhThu: acc.doanhThu + (r.doanhThu || 0),
        soLuongSanXuat: acc.soLuongSanXuat + (r.soLuongSanXuat || 0),
        soLuongDatQC: acc.soLuongDatQC + (r.soLuongDatQC || 0),
        soLuongLoi: acc.soLuongLoi + (r.soLuongLoi || 0),
        tongChiLuong: acc.tongChiLuong + (r.tongChiLuong || 0),
      }),
      { doanhThu: 0, soLuongSanXuat: 0, soLuongDatQC: 0, soLuongLoi: 0, tongChiLuong: 0 }
    );

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
