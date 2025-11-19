const Department = require("../models/Department");

exports.getAll = async (req, res) => {
  try {
    const depts = await Department.find().sort({ createdAt: -1 }).lean();
    res.status(200).json(depts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json(dept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ message: "Created department", department: dept });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Updated department", department: dept });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: "Department not found" });
    res.status(200).json({ message: "Deleted department" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

