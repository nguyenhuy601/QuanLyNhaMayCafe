const express = require("express");
const cors = require("cors");
require("dotenv").config();

const reportRoutes = require("./src/routes/report.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "director-service",
    timestamp: new Date().toISOString(),
  });
});

app.use("/", reportRoutes);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`🚀 Director-Service running on port ${PORT}`));

module.exports = app;

