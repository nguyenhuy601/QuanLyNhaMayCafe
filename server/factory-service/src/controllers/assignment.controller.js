const WorkAssignment = require("../models/WorkAssignment");
const ProductionLog = require("../models/ProductionLog");

/** Lấy danh sách phân công */
exports.getAssignments = async (req, res) => {
  try {
    const list = await WorkAssignment.find()
      .populate("keHoach toSanXuat caLam nguoiTao")
      .sort({ ngayPhanCong: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xưởng trưởng tạo phân công cho tổ */
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await WorkAssignment.create({
      ...req.body,
      trangThai: "Đang thực hiện",
      ngayPhanCong: new Date(),
    });
    res.status(201).json({ message: "Phân công thành công", assignment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật trạng thái phân công (hoàn thành / hủy) */
exports.updateAssignment = async (req, res) => {
  try {
    const updated = await WorkAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật phân công thành công", updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Ghi nhận kết quả sản xuất cho một phân công */
exports.submitProductionLog = async (req, res) => {
  try {
    const { assignmentId, soLuongHoanThanh, soLuongLoi, ghiChu } = req.body;
    const log = await ProductionLog.create({
      phanCong: assignmentId,
      soLuongHoanThanh,
      soLuongLoi,
      ghiChu,
      ngayGhiNhan: new Date(),
    });

    // Nếu hoàn thành → cập nhật trạng thái
    await WorkAssignment.findByIdAndUpdate(assignmentId, { trangThai: "Hoàn thành" });

    res.status(201).json({ message: "Đã ghi nhận kết quả sản xuất", log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
