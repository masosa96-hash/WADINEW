// WADI API – static + API routing OK for Render (Deploy Trigger)

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./api-routes"; // TS file
// import kivoRoutes from "./routes/kivo";
// import monitoringRoutes from "./routes/monitoring";

import { requestLogger } from "./middleware/requestLogger";
import { rateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { startWorker } from "./queue/worker";

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
      frontendPath,
      cwd: process.cwd(),
      rootContents,
      assetsContents,
      timestamp: Date.now(),
      version: "5.1.0", // Bump version to verify deploy
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      frontendPath,
    });
  }
});

// --------------------------------------------------
// PRIORITY 2: Static Assets (Correctly Ordered)
// --------------------------------------------------

// Serve specialized files first
app.get("/sw.js", (req, res) => {
  res.sendFile(path.join(frontendPath, "sw.js"), {
    headers: { "Content-Type": "application/javascript" },
  });
});

app.get("/manifest.json", (req, res) => {
  res.sendFile(path.join(frontendPath, "manifest.json"), {
    headers: { "Content-Type": "application/manifest+json" },
  });
});

// Serve assets with strict MIME types and NO fallback to index.html
// This ensures that if a CSS/JS file is missing, it 404s instead of returning HTML
app.use(
  "/assets",
  express.static(path.join(frontendPath, "assets"), {
    fallthrough: false, // CRITICAL: Do not pass to next middleware if file missing
    etag: true, // Let browser cache logic work
    lastModified: true,
    setHeaders: (res, path) => {
      // Versioned assets (Vite uses hashes) can be cached forever-ish
      if (path.match(/\.[0-9a-f]{8,}\./)) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

// Fallback for strict strict asset 404s (double safety)
app.use(/\/assets\/.*/, (req, res) => {
  res.status(404).send("Asset Not Found");
});

// Serve the rest of the static files (favicon, etc) from root
app.use(express.static(frontendPath));

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
// PRIORITY 3: SPA Fallback
// --------------------------------------------------
app.get(/.*/, (req, res) => {
  // Don't serve index.html for API calls or obviously wrong paths that slipped through
  if (req.path.startsWith("/api") || req.path.startsWith("/assets")) {
    return res.status(404).send("Not Found");
  }
  res.sendFile(path.join(frontendPath, "index.html"));
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
