const Position = require("../models/Position");

/** Danh sách chức vụ */
exports.getAllPositions = async (req, res) => {
  try {
    const positions = await Position.find().sort({ createdAt: -1 });
    res.status(200).json(positions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo chức vụ mới */
exports.createPosition = async (req, res) => {
  try {
    const pos = await Position.create(req.body);
    res.status(201).json({ message: "Thêm chức vụ thành công", pos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
