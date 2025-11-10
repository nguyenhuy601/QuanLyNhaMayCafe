const mongoose = require("mongoose");

const QCDefectCategorySchema = new mongoose.Schema({
  tenLoaiLoi: { type: String, required: true },
  moTa: String
});

module.exports = mongoose.model("QCDefectCategory", QCDefectCategorySchema);

