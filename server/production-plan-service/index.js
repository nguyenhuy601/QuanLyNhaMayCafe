const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const { listenDirectorEvents } = require("./src/rabbitmq/listener");
const app = express();
const routes = require("./src/routers/plan.routes");

app.use(cors({
  origin: "http://localhost:5173", // Địa chỉ frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ Cho phép preflight requests (OPTIONS)
app.options("*", cors());
app.use(express.json());

// Gắn route chính
app.use("/", routes);
listenDirectorEvents();

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Production-Service running on port ${PORT}`));
