const WorkShift = require("../models/WorkShift");

/** Lấy danh sách ca làm việc */
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await WorkShift.find().sort({ startTime: 1 });
    res.status(200).json(shifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Thêm ca làm việc */
exports.createShift = async (req, res) => {
  try {
    const shift = await WorkShift.create(req.body);
    res.status(201).json({ message: "Thêm ca làm việc thành công", shift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
