const Workshop = require("../models/Workshop");

/** Lấy danh sách xưởng sản xuất */
exports.getAllWorkshops = async (req, res) => {
  try {
    const workshops = await Workshop.find().populate("truongXuong").sort({ createdAt: -1 });
    res.status(200).json(workshops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo xưởng mới */
exports.createWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.create(req.body);
    res.status(201).json({ message: "Thêm xưởng thành công", workshop });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Cập nhật thông tin xưởng */
exports.updateWorkshop = async (req, res) => {
  try {
    const updated = await Workshop.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật xưởng thành công", workshop: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
