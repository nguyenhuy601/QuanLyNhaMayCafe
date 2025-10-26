const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const reportRoutes = require("./src/routers/report.routes");
const { listenEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/reports", reportRoutes);

// Lắng nghe tất cả event hệ thống
listenEvents();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Report-Service running on port ${PORT}`));
