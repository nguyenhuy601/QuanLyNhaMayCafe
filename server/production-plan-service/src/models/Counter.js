const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  date: { type: String, unique: true }, // YYYYMMDD
  seq: { type: Number, default: 0 },
});

module.exports = mongoose.model("Counter", CounterSchema);
