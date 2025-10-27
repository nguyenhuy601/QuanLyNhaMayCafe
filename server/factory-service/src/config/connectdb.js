const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;

const clientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    console.log("✅ You successfully connected to MongoDB!");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  }
}

run();
