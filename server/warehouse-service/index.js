const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const materialRoutes = require("./src/materials/routes/index");
const productRoutes = require("./src/products/routes/index");
const { listenEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/materials", materialRoutes);
app.use("/products", productRoutes);

// Khởi động RabbitMQ listener với error handling
listenEvents().catch(err => {
  console.error("❌ [warehouse-service] Failed to start RabbitMQ listener:", err.message);
  console.error("❌ [warehouse-service] Stack:", err.stack);
  // Không exit, service vẫn chạy được dù không có RabbitMQ
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Warehouse-Service running on port ${PORT}`);
  console.log("📡 [warehouse-service] RabbitMQ listener starting...");
});
