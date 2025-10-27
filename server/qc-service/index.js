const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');

const app = express();
const routes = require("./src/routers/index");
const { listenFactoryEvents } = require("./src/rabbitmq/listener");

app.use(cors());
app.use(express.json());

// Gắn route chính
app.use("/", routes);
app.use("/", routes);

// Nhận event PRODUCTION_DONE từ factory
listenFactoryEvents();

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 QC-Service running on port ${PORT}`));
