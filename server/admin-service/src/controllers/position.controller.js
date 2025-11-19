const Position = require("../models/Position");

exports.getAll = async (req, res) => {
  try {
    const positions = await Position.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(positions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const position = await Position.findById(req.params.id);
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.status(200).json(position);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const position = await Position.create(req.body);
    res.status(201).json({ message: "Created position", position });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const position = await Position.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.status(200).json({ message: "Updated position", position });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const position = await Position.findByIdAndDelete(req.params.id);
    if (!position) return res.status(404).json({ message: "Position not found" });
    res.status(200).json({ message: "Deleted position" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

