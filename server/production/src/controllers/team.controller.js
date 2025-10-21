const Team = require("../models/Team");

/** Lấy danh sách tổ sản xuất */
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate("xuong toTruong danhSachCongNhan")
      .sort({ createdAt: -1 });
    res.status(200).json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/** Tạo tổ mới */
exports.createTeam = async (req, res) => {
  try {
    const team = await Team.create(req.body);
    res.status(201).json({ message: "Thêm tổ thành công", team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
