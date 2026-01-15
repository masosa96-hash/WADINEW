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

// --------------------------------------------------
// SECURITY: CSP (Content Security Policy)
// --------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'", "https://wadi-wxg7.onrender.com"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://js.hcaptcha.com",
          "https://wadi-wxg7.onrender.com",
        ],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://hcaptcha.com",
          "https://fonts.googleapis.com",
        ],
        styleSrcElem: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.supabase.co",
          "https://*.supabase.in",
          "https://wadi-wxg7.onrender.com",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://smkbiguvgiscojwxgbae.supabase.co",
          "https://*.supabase.co",
          "https://*.supabase.in",
          "wss://*.supabase.co",
          "wss://smkbiguvgiscojwxgbae.supabase.co",
          "https://api.openai.com",
          "https://api.groq.com",
          "https://*.hcaptcha.com",
          "https://hcaptcha.com",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
          "https://wadi-wxg7.onrender.com",
        ],
        frameSrc: [
          "'self'",
          "https://*.hcaptcha.com",
          "https://newassets.hcaptcha.com",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://wadi-wxg7.onrender.com",
  "https://ideal-essence-production.up.railway.app", // Kivo/WADI prod
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// app.use(requestLogger as any);

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
// PRIORITY 2: Health Check (Render)
// --------------------------------------------------
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// --------------------------------------------------
// PRIORITY 1: API & System Routes
// --------------------------------------------------
import projectsRouter from "./routes/projects";
import runsRouter from "./routes/runs";

// V2 Domain Routes
import projectsV2Router from "./domain/projects/project.routes";

// app.use("/api", rateLimiter as any);
app.use("/api/projects", projectsRouter); // Keep V1 for safety? Or replace? User said "Backend CRUD". I'll add V2.
app.use("/api/v2/projects", projectsV2Router);

app.use("/api", runsRouter);
app.use("/api", routes); // Main API (Legacy/Raw)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// app.use("/api/kivo", kivoRoutes as any); // Legacy/Module
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// app.use("/system", monitoringRoutes as any);

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
const PORT = process.env.PORT || 3000;
app.listen(asAny(PORT), asAny("0.0.0.0"), () => {
  console.log(`WADI API running on port ${PORT}`);
});

// Helper for strict listen types if needed, though usually string port is fine in express types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asAny(val: any): any {
  return val;
}
