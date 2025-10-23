const express = require("express");
const httpProxy = require("http-proxy");
require("dotenv").config();

const app = express();
const proxy = httpProxy.createProxyServer({});

// Middleware xác thực cơ bản
app.use(async (req, res, next) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/public")) return next();
  // Có thể gọi sang auth-service để verify token
  next();
});

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL;
const HR_SERVICE_URL = process.env.HR_SERVICE_URL;
const MATERIAL_SERVICE_URL = process.env.MATERIAL_SERVICE_URL;
const PRODUCTION_SERVICE_URL = process.env.PRODUCTION_SERVICE_URL;
const QC_SERVICE_URL = process.env.QC_SERVICE_URL;
const SALES_SERVICE_URL = process.env.SALES_SERVICE_URL;

app.use("/api", (req, res) => {
  req.url = `/api${req.url}`;
  proxy.web(req, res, { target: AUTH_SERVICE_URL });
});

app.use("/finance", (req, res) => {
  req.url = `/finance${req.url}`;
  proxy.web(req, res, { target: FINANCE_SERVICE_URL });
});

app.use("/hr", (req, res) => {
  req.url = `/hr${req.url}`;
  proxy.web(req, res, { target: HR_SERVICE_URL });
});

app.use("/material", (req, res) => {
  req.url = `/material${req.url}`;
  proxy.web(req, res, { target: MATERIAL_SERVICE_URL });
});

app.use("/production", (req, res) => {
  req.url = `/production${req.url}`;
  proxy.web(req, res, { target: PRODUCTION_SERVICE_URL });
});

app.use("/qc", (req, res) => {
  req.url = `/qc${req.url}`;
  proxy.web(req, res, { target: QC_SERVICE_URL });
});

app.use("/sales", (req, res) => {
  req.url = `/sales${req.url}`;
  proxy.web(req, res, { target: SALES_SERVICE_URL });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
