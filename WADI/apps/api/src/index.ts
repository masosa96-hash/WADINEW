// WADI API – static + API routing OK for Render (Deploy Trigger)

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./api-routes"; // TS file
// import kivoRoutes from "./routes/kivo";
// import monitoringRoutes from "./routes/monitoring";

import { requestLogger } from "./middleware/requestLogger";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/error.middleware";
// import { startWorker } from "./queue/worker";
// import "./queue/aiWorker"; // Start AI Worker side-effect

// Initialize Worker in the same process
// startWorker();

import path from "path";
import fs from "fs";
// import { fileURLToPath } from "url";

if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: "../../.env" });
}

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend/dist");

import helmet from "helmet";

export const app = express();

// 1. EL "FIX" TOTAL: Configuración manual y estricta
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://wadi-wxg7.onrender.com', 
    'http://localhost:5173', 
    'http://localhost:3000'
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Default to production if no match (or block, but for now we want to be safe)
    // Actually, if we don't send the header, browser blocks it. 
    // Let's allow specific origins only.
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');

  // 2. Responder de inmediato a la "comprobación previa" (OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Enable Proxy Trust for Render
app.set('trust proxy', 1);

// --------------------------------------------------
// PRIORITY 0: Health Check (Render) - Must be first
// --------------------------------------------------
// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: 'WADI ONLINE' });
});
// Health Check Alias for Frontend (VITE_API_URL often includes /api)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: 'WADI ONLINE (API Alias)' });
});

app.use(express.json());



// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(requestLogger as any);

// TOP PRIORITY DEBUG ROUTE
app.get("/system/debug-files", (req, res) => {
  try {
    const assetsPath = path.join(frontendPath, "assets");

    const rootContents = fs.existsSync(frontendPath)
      ? fs.readdirSync(frontendPath)
      : "FRONTEND_DIR_NOT_FOUND";

    const assetsContents = fs.existsSync(assetsPath)
      ? fs.readdirSync(assetsPath)
      : "ASSETS_DIR_NOT_FOUND";

    res.json({
      version: "5.1.0",
      env: process.env.NODE_ENV
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.status(500).json({
      error: err.message
    });
  }
});

// System Routes (Temporary Debug)
import systemRoutes from "./routes/system.routes";
app.use(systemRoutes);

// --------------------------------------------------
// PRIORITY 1: API & System Routes
// --------------------------------------------------
// import projectsRouter from "./routes/projects";
// import runsRouter from "./routes/runs";

// V2 Domain Routes
// import projectsV2Router from "./domain/projects/project.routes";

// Rate Limiter (After Logger, before Routes, scoped to /api)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use("/api", rateLimiter as any);

// Standardized API Routes
// app.use("/api/projects", projectsRouter);
// app.use("/api/v2/projects", projectsV2Router);
// app.use("/api", runsRouter);
app.use("/api", routes);

// Explicit 404 for API to prevent falling through to SPA
app.all(/\/api\/.*/, (req, res) => {
  res.status(404).json({ error: "API_ROUTE_NOT_FOUND" });
});

// --------------------------------------------------
// PRIORITY 3: Fallback (404)
// --------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.path });
});

// Error Handler
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(errorHandler as any);

// START SERVER
const PORT = process.env.PORT || 10000;
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log('Servidor escuchando en el puerto: ' + PORT);
  
  // Log Active Routes
  if (app._router && app._router.stack) {
      console.log('Rutas activas:');
      app._router.stack.forEach((r: any) => {
          if (r.route && r.route.path) {
              console.log(r.route.path);
          } else if (r.name === 'router') {
              // Express routers don't expose paths easily in the regex, 
              // but we can imply them from the mount points we just set.
              // Just logging the top level is often enough, or specifically known routes.
              // Logic requested by user:
              // app._router.stack.filter(r => r.route).map(r => r.route.path)
          }
      });
      const activeRoutes = app._router.stack
        .filter((r: any) => r.route)
        .map((r: any) => r.route.path);
      console.log('Rutas Directas:', activeRoutes);
  }
});

// Graceful Custom Shutdown
const gracefulShutdown = () => {
  console.log('SIGTERM/SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    // Close other connections like DB if needed here in the future
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Helper for strict listen types if needed, though usually string port is fine in express types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asAny(val: any): any {
  return val;
}
