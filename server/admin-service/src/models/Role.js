const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    maRole: { type: String, required: true, unique: true, trim: true },
    tenRole: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
    quyen: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Role", RoleSchema);

