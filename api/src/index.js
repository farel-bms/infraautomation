require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const db      = require("./db");
const users   = require("./routes/users");
const metrics = require("./metrics");

const app      = express();
const PORT     = process.env.PORT     || 8080;
const METRICS_PORT = process.env.METRICS_PORT || 9100;

// ── Middleware ──────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

// Count every request for Prometheus metrics
app.use((req, _res, next) => {
  metrics.increment();
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ── Application routes ──────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "lks-api", timestamp: new Date().toISOString() })
);
app.use("/api/users", users);

// ── 404 ─────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "Not Found" }));

// ── Error handler ────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  metrics.incrementError();
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ── Metrics server (port 9100) ──────────────────────────
// Separate HTTP server for Prometheus scraping.
// This port is only accessible from inside the VPC (Security Group lks-sg-ecs
// allows TCP 9100 inbound from 10.1.0.0/16 for inter-region Prometheus scraping).
const metricsApp = express();
metricsApp.get("/metrics", (_req, res) => {
  res.set("Content-Type", "text/plain; version=0.0.4");
  res.send(metrics.buildMetrics());
});
metricsApp.get("/health", (_req, res) => res.send("OK"));

// ── Start both servers ───────────────────────────────────
async function start() {
  await db.connect();

  app.listen(PORT, () => {
    console.log(`lks-api application server listening on :${PORT}`);
  });

  metricsApp.listen(METRICS_PORT, () => {
    console.log(`lks-api metrics server listening on :${METRICS_PORT}`);
    console.log(`Prometheus can scrape http://<task-ip>:${METRICS_PORT}/metrics`);
    console.log(`(via Inter-Region VPC Peering pcx-lks-2026 from us-west-2)`);
  });
}

start().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
