const mongoose = require("mongoose");

/**
 * Minimal Employee model so services that reference Employee via ObjectId can populate
 * (This service may not own the Employee collection; this model avoids Mongoose "Schema hasn't been registered" errors.)
 */
const EmployeeSchema = new mongoose.Schema({
  hoTen: String,
  chucVu: String,
  email: String,
  phone: String
}, { timestamps: true });

module.exports = mongoose.model("Employee", EmployeeSchema);
