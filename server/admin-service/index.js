const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require('./src/config/connectdb');

const app = express();
const routes = require("./src/routers/user.routes");

app.use(cors());
app.use(express.json());

// Gắn route chính
app.use("/", routes);

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Admin-Service running on port ${PORT}`));
