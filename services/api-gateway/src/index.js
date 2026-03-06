require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const SAMPLE_SERVICE_URL = process.env.SAMPLE_SERVICE_URL || "http://localhost:3001";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(morgan("combined"));
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-gateway", timestamp: new Date().toISOString() });
});

// Proxy routes
app.use(
  "/sample",
  createProxyMiddleware({
    target: SAMPLE_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: { "^/sample": "" },
    on: {
      error: (err, _req, res) => {
        console.error("Proxy error:", err.message);
        res.status(502).json({ error: "Bad Gateway", message: err.message });
      },
    },
  })
);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
