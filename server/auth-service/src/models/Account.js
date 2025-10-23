const mongoose = require("mongoose");

const AccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", AccountSchema);
