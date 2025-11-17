const express = require("express");
const httpProxy = require("http-proxy");
require("dotenv").config();

const app = express();
const proxy = httpProxy.createProxyServer({});

// Log proxy errors and return a helpful message
proxy.on('error', (err, req, res) => {
  console.error('[API-GATEWAY] Proxy error:', err && err.message);
  try {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json' });
    }
    res.end(JSON.stringify({ error: 'Bad gateway', details: err && err.message }));
  } catch (e) {
    console.error('[API-GATEWAY] Error sending proxy error response', e && e.message);
  }
});

// Middleware xác thực cơ bản
app.use(async (req, res, next) => {
  if (req.path.startsWith("/auth") || req.path.startsWith("/public")) return next();
  // Có thể gọi sang auth-service để verify token
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
  req.url = `/admin${req.url}`;
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

app.use("/production", (req, res) => {
  proxy.web(req, res, { target: PRODUCTION_PLAN_SERVICE_URL });
});

app.use("/qc", (req, res) => {
  proxy.web(req, res, { target: QC_SERVICE_URL });
});

app.use("/report", (req, res) => {
  proxy.web(req, res, { target: REPORT_SERVICE_URL });
});

app.use("/orders", (req, res) => {
  proxy.web(req, res, { target: SALES_SERVICE_URL });
});

app.use("/warehouse", (req, res) => {
  // Rewrite /warehouse/* to /* and log for debugging
  const originalUrl = req.originalUrl || req.url;
  req.url = req.url.replace(/^\/warehouse/, "");
  console.log('[API-GATEWAY] /warehouse -> target=', WAREHOUSE_SERVICE_URL, ' originalUrl=', originalUrl, ' rewrittenUrl=', req.url);
  proxy.web(req, res, { target: WAREHOUSE_SERVICE_URL, changeOrigin: true });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});