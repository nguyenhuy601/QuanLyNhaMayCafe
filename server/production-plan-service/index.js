const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const { listenDirectorEvents } = require("./src/rabbitmq/listener");
const app = express();
const routes = require("./src/routers/plan.routes");

app.use(cors());
app.use(express.json());

// Gắn route chính
app.use("/api/plans", routes);
listenDirectorEvents();

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Production-Service running on port ${PORT}`));
