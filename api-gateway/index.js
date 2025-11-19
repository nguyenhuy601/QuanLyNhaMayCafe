const express = require("express");
const httpProxy = require("http-proxy");
require("dotenv").config();

const app = express();
const proxy = httpProxy.createProxyServer({
  // Give more time for services to respond
  timeout: 30000,
  proxyTimeout: 30000,
});

// Enable CORS headers manually (without cors package)
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", FRONTEND_URL);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Handle proxy errors gracefully
proxy.on("error", (err, req, res) => {
  console.error("❌ Proxy error:", err.message);
  res.status(503).json({
    error: "Service unavailable",
    message: err.message,
  });
});

proxy.on("proxyRes", (proxyRes, req, res) => {
  // Ensure CORS headers are included in proxy response
  proxyRes.headers["Access-Control-Allow-Origin"] = FRONTEND_URL;
});

// Basic auth middleware
app.use(async (req, res, next) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/public")) return next();
  next();
});

const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const DIRECTOR_SERVICE_URL = process.env.DIRECTOR_SERVICE_URL;
const FACTORY_SERVICE_URL = process.env.FACTORY_SERVICE_URL;
const PRODUCTION_PLAN_SERVICE_URL = process.env.PRODUCTION_PLAN_SERVICE_URL;
const QC_SERVICE_URL = process.env.QC_SERVICE_URL;
const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL;
const SALES_SERVICE_URL = process.env.SALES_SERVICE_URL;
const WAREHOUSE_SERVICE_URL = process.env.WAREHOUSE_SERVICE_URL;

app.use("/admin", (req, res) => {
  proxy.web(req, res, { target: ADMIN_SERVICE_URL });
});

app.use("/auth", (req, res) => {
  proxy.web(req, res, { target: AUTH_SERVICE_URL });
});

app.use("/director", (req, res) => {
  proxy.web(req, res, { target: DIRECTOR_SERVICE_URL });
});

app.use("/factory", (req, res) => {
  proxy.web(req, res, { target: FACTORY_SERVICE_URL });
});

app.use("/plan", (req, res) => {
  proxy.web(req, res, { target: PRODUCTION_PLAN_SERVICE_URL });
});

app.use("/qc-request", (req, res) => {
  proxy.web(req, res, { target: QC_SERVICE_URL });
});

app.use("/qc-result", (req, res) => {
  proxy.web(req, res, { target: QC_SERVICE_URL });
});

app.use("/report", (req, res) => {
  proxy.web(req, res, { target: REPORT_SERVICE_URL });
});

app.use("/orders", (req, res) => {
  req.url = `/orders${req.url}`;
  proxy.web(req, res, { target: SALES_SERVICE_URL });
});

app.use("/warehouse", (req, res) => {
  proxy.web(req, res, { target: WAREHOUSE_SERVICE_URL });
});

app.use("/customers", (req, res) => {
  req.url = `/customers${req.url}`;
  proxy.web(req, res, { target: SALES_SERVICE_URL });
});

app.use("/products", (req, res) => {
  req.url = `/products${req.url}`;
  proxy.web(req, res, { target: SALES_SERVICE_URL });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});