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

const app = express();

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173', 
      'http://localhost:3000',
      'https://wadi-wxg7.onrender.com'
    ];
    
    // Check if origin is in allowed list or is a Render subdomain
    if (allowedOrigins.indexOf(origin) !== -1 || /\.onrender\.com$/.test(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS for origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'rndr-id'],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

// 1. Habilitar CORS con la configuración estricta (MUST BE FIRST)
app.use(cors(corsOptions));

// 2. Manejo explícito de peticiones Preflight para todas las rutas
app.options('*', cors(corsOptions));

// --------------------------------------------------
// PRIORITY 0: Health Check (Render) - Must be first
// --------------------------------------------------
// Health Check
app.get("/health", (req, res) => {
  res.status(200).send("OK");
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



// --------------------------------------------------
// PRIORITY 1: API & System Routes
// --------------------------------------------------
// import projectsRouter from "./routes/projects";
// import runsRouter from "./routes/runs";

// V2 Domain Routes
// import projectsV2Router from "./domain/projects/project.routes";

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
