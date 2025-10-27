const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const approvalRoutes = require("./src/routers/approval.routes");
const { listenOrderEvents } = require("./src/rabbitmq/listener");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", approvalRoutes);

// Bắt sự kiện ORDER_CREATED từ sales-service
listenOrderEvents();

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Director-Service running on port ${PORT}`));
