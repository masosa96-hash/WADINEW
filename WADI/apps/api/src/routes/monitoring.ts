import express from "express";
import { getHttpMetrics } from "../services/http-metrics.service";

const router = express.Router();

// MUST HAVE for Render Healthcheck
router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

// Metrics Endpoint
router.get("/metrics", (_req, res) => {
  res.json(getHttpMetrics());
});

// Optional: readiness
router.get("/ready", (_req, res) => {
  res.status(200).json({ ready: true });
});

export default router;
