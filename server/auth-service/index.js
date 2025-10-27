const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');

const authRoutes = require("./src/routers/auth.routes");
const { listenUserEvents } = require("./src/rabbitmq/listener");

const app = express();

app.use(cors());
app.use(express.json());

// Gắn route chính
app.use("/", authRoutes);
listenUserEvents();

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Auth-Service running on port ${PORT}`));
