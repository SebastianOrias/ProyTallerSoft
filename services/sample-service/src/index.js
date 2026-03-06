require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "sample-service", timestamp: new Date().toISOString() });
});

// Sample data endpoint
app.get("/api/data", (_req, res) => {
  res.json({
    message: "Hello from sample-service",
    data: [
      { id: 1, name: "Item One", value: 100 },
      { id: 2, name: "Item Two", value: 200 },
      { id: 3, name: "Item Three", value: 300 },
    ],
  });
});

// External API endpoint
app.get("/api/external", async (_req, res) => {
  try {
    const { data } = await axios.get("https://jsonplaceholder.typicode.com/posts", {
      params: { _limit: 5 },
    });
    res.json({ source: "jsonplaceholder.typicode.com", posts: data });
  } catch (err) {
    console.error("External API error:", err.message);
    res.status(502).json({ error: "Failed to fetch from external API", message: err.message });
  }
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, () => {
  console.log(`Sample service running on port ${PORT}`);
});
