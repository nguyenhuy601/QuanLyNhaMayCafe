const DefectCategory = require("../models/DefectCategory");

/** Lấy danh sách phân loại lỗi */
exports.getAllDefects = async (req, res) => {
  try {
    const list = await DefectCategory.find().sort({ createdAt: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Thêm loại lỗi mới */
exports.createDefect = async (req, res) => {
  try {
    const defect = await DefectCategory.create(req.body);
    res.status(201).json({ message: "Thêm phân loại lỗi thành công", defect });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật phân loại lỗi */
exports.updateDefect = async (req, res) => {
  try {
    const updated = await DefectCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", defect: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Xóa phân loại lỗi */
exports.deleteDefect = async (req, res) => {
  try {
    await DefectCategory.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
