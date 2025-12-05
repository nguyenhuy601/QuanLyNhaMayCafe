const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    // Mã vai trò - tự sinh, không bắt buộc nhập
    maRole: { type: String, unique: true, trim: true },
    tenRole: { type: String, required: true, unique: true, trim: true },
    moTa: { type: String },
    quyen: [{ type: String }],
  },
  { timestamps: true }
);

// Tự động sinh maRole nếu chưa có
RoleSchema.pre("save", function (next) {
  if (!this.maRole) {
    const prefix = "ROLE";
    const slug =
      this.tenRole
        ?.toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")
        .toUpperCase() || "AUTO";
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.maRole = `${prefix}_${slug}_${rand}`;
  }
  next();
});

module.exports = mongoose.model("Role", RoleSchema);

