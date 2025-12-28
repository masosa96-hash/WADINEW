import express from "express";
const router = express.Router();

// Simple in-memory metrics (resets on restart)
// In production with multiple instances, this is local to the instance.
const metrics = {
  requests: {
    "2xx": 0,
    "4xx": 0,
    "5xx": 0,
  },
  latencies: [], // Store last 1000 latencies for p95/p99 calculation
};

export const recordMetric = (statusCode, latency) => {
  if (statusCode >= 200 && statusCode < 300) metrics.requests["2xx"]++;
  else if (statusCode >= 400 && statusCode < 500) metrics.requests["4xx"]++;
  else if (statusCode >= 500) metrics.requests["5xx"]++;

  metrics.latencies.push(latency);
  if (metrics.latencies.length > 1000) metrics.latencies.shift();
};

const calculatePercentile = (percentile) => {
  if (metrics.latencies.length === 0) return 0;
  const sorted = [...metrics.latencies].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
};

// MUST HAVE for Render Healthcheck
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Metrics Endpoint
router.get("/metrics", (req, res) => {
  res.json({
    counts: metrics.requests,
    p95: calculatePercentile(95),
    p99: calculatePercentile(99),
    sampleSize: metrics.latencies.length,
  });
});

// Optional: readiness
router.get("/ready", (req, res) => {
  res.status(200).json({ ready: true });
});

export default router;
