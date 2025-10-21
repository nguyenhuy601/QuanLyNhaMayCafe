const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
require("./src/config/connectdb");

const app = express();
const routes = require("./src/routers/index");

app.use(cors());
app.use(express.json());

// Gắn route chính
app.use("/api", routes);

// Cổng mặc định
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`🚀 Auth-Service running on port ${PORT}`));
