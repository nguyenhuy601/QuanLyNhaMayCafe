const Position = require("../models/Position");

exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find();
    res.status(200).json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createPosition = async (req, res) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json({ message: "Thêm chức vụ thành công", position });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Position.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Cập nhật thành công", position: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await Position.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa chức vụ thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};