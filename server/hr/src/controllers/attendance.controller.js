const Attendance = require("../models/Attendance");

/** Lấy danh sách chấm công */
exports.getAllAttendances = async (req, res) => {
  try {
    const list = await Attendance.find()
      .populate("nhanVien caLamViec nguoiChamCong")
      .sort({ ngay: -1 });
    res.status(200).json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Chấm công */
exports.createAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.create(req.body);
    res.status(201).json({ message: "Chấm công thành công", attendance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
