// WADI API – static + API routing OK for Render (Deploy Trigger)

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import routes from "./routes.js";
import kivoRoutes from "./routes/kivo.js";
import monitoringRoutes from "./routes/monitoring.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { errorHandler } from "./middleware/errorHandler.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config({ path: "../../.env" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, "../../frontend/dist");

import helmet from "helmet";

const app = express();

// --------------------------------------------------
// SECURITY: CSP (Content Security Policy)
// --------------------------------------------------
// --------------------------------------------------
// SECURITY: CSP (Content Security Policy)
// --------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.hcaptcha.com"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://hcaptcha.com",
          "https://fonts.googleapis.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://*.supabase.co",
          "https://*.supabase.in",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
        connectSrc: [
          "'self'",
          "https://smkbiguvgiscojwxgbae.supabase.co",
          "https://*.supabase.co",
          "https://*.supabase.in",
          "https://api.openai.com",
          "https://api.groq.com",
          "https://*.hcaptcha.com",
          "https://hcaptcha.com",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com",
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
app.use(requestLogger);

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
      version: "1.0.1", // Bump version to verify deploy
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
      stack: err.stack,
      frontendPath,
    });
  }
});

// --------------------------------------------------
// --------------------------------------------------
// PRIORITY 2: Static Assets (Correctly Ordered)
// --------------------------------------------------

// Serve specialized files first
app.get("/sw.js", (req, res) => {
  res.sendFile(path.join(frontendPath, "sw.js"), {
    headers: { "Content-Type": "application/javascript" },
  });
});

app.get("/manifest.webmanifest", (req, res) => {
  res.sendFile(path.join(frontendPath, "manifest.webmanifest"), {
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
app.use("/api", rateLimiter);
app.use("/api", routes); // Main API
app.use("/api/kivo", kivoRoutes); // Legacy/Module
app.use("/system", monitoringRoutes);

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
app.use(errorHandler);

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`WADI API running on port ${PORT}`);
});
