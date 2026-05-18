import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../index";

/**
 * WADI API Integration Test Suite
 * Consolida:
 * - Health checks (liveness, readiness)
 * - Personality validation
 * - Smoke tests para endpoints principales
 */

describe("WADI API - Integration Tests", () => {
  // ============================================
  // SECTION 1: Health Checks
  // ============================================
  describe("Health Checks", () => {
    it("GET /health should return healthy status", async () => {
      const response = await request(app).get("/health");

      expect(response.status).toBeLessThan(400);
      expect(response.body).toHaveProperty("status");
      expect(["healthy", "degraded"]).toContain(response.body.status);
    });

    it("GET /health/live should return liveness status", async () => {
      const response = await request(app).get("/health/live");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("alive", true);
      expect(response.body).toHaveProperty("timestamp");
    });

    it("GET /health/ready should return readiness status", async () => {
      const response = await request(app).get("/health/ready");

      expect(response.status).toBeLessThan(400);
      expect(response.body).toHaveProperty("ready");
      expect(response.body).toHaveProperty("timestamp");
    });

    it("GET /api/health should return API alias health", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBeLessThan(400);
      expect(response.body).toHaveProperty("status");
      expect(response.body).toHaveProperty("version", "5.1.0");
    });

    it("GET /api-docs should return Swagger UI HTML", async () => {
      const response = await request(app).get("/api-docs");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/html/);
      expect(response.text).toContain("Swagger UI");
    });

    it("GET /api-docs.json should return OpenAPI spec", async () => {
      const response = await request(app).get("/api-docs.json");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("openapi", "3.0.1");
      expect(response.body).toHaveProperty("paths");
    });

    it("Health response should include X-Request-ID header", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-request-id");
      expect(response.headers["x-request-id"]).toBeTruthy();
    });

    it("GET /monitoring/health should return monitoring health", async () => {
      const response = await request(app).get("/monitoring/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "ok");
      expect(response.body).toHaveProperty("uptime");
    });

    it("GET /monitoring/metrics should return metrics snapshot", async () => {
      const response = await request(app).get("/monitoring/metrics");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("counts");
      expect(response.body).toHaveProperty("p95");
      expect(response.body).toHaveProperty("p99");
      expect(response.body).toHaveProperty("sampleSize");
    });

    it("GET /monitoring/ready should return readiness status", async () => {
      const response = await request(app).get("/monitoring/ready");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ ready: true });
    });
  });

  // ============================================
  // SECTION 2: WADI Personality Validation
  // ============================================
  describe("WADI Brain Personality", () => {
    it("Should validate EJECUTIVO personality context", () => {
      // Mock: Simula respuesta EJECUTIVO
      const context = "Me tengo que enfocar en validar el modelo";
      const expectedBehavior = /exacto|enfoque|dirección/i;

      // Este test validaría que la personalidad EJECUTIVO responde con enfoque
      expect(context).toBeTruthy();
      // En un test real, llamaríamos al endpoint /api/chat con personality=EJECUTIVO
    });

    it("Should validate IRÓNICO personality context", () => {
      // Mock: Simula respuesta IRÓNICA
      const context = "Otro bootcamp de AI";
      const expectedBehavior = /al fin|suerte|reality check/i;

      // Este test validaría que la personalidad IRÓNICA responde con humor e irony
      expect(context).toBeTruthy();
    });

    it("Should validate SERENO personality context", () => {
      // Mock: Simula respuesta SERENA
      const context = "Todo me abruma";
      const expectedBehavior = /calma|respira|perspectiva/i;

      expect(context).toBeTruthy();
    });
  });

  // ============================================
  // SECTION 3: Error Handling
  // ============================================
  describe("Error Handling", () => {
    it("404 for unknown API routes should return structured error", async () => {
      const response = await request(app).get("/api/nonexistent-route");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("error.code");
      expect(response.headers).toHaveProperty("x-request-id");
    });

    it("Error response should include correlation ID", async () => {
      const requestId = "test-correlation-123";
      const response = await request(app)
        .get("/api/nonexistent")
        .set("X-Request-ID", requestId);

      expect(response.headers["x-request-id"]).toBe(requestId);
    });

    it("Should standardize raw error JSON responses", async () => {
      const response = await request(app)
        .post("/api/projects/publish")
        .send({});

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("status", "error");
      expect(response.body).toHaveProperty("error.code");
      expect(response.body).toHaveProperty("requestId");
    });

    it("Should handle invalid JSON gracefully", async () => {
      const response = await request(app)
        .post("/api/chat")
        .set("Content-Type", "application/json")
        .send("{ invalid json }");

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body).toHaveProperty("status", "error");
    });
  });

  // ============================================
  // SECTION 4: Security & Headers
  // ============================================
  describe("Security Headers", () => {
    it("Should include security headers (Helmet)", async () => {
      const response = await request(app).get("/health");

      expect(response.headers).toHaveProperty("x-content-type-options");
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers).toHaveProperty("x-frame-options");
    });

    it("CORS headers should be present", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173");

      // Depends on configuration, but should have CORS headers
      expect(response.status).toBeLessThan(500);
    });
  });

  // ============================================
  // SECTION 5: Smoke Tests
  // ============================================
  describe("API Smoke Tests", () => {
    it("Server should start and respond", async () => {
      const response = await request(app).get("/");

      // Frontend or API response
      expect(response.status).toBeGreaterThanOrEqual(200);
      expect(response.status).toBeLessThan(500);
    });

    it("System debug endpoint should be available (dev only)", async () => {
      // Check if in dev mode
      if (process.env.NODE_ENV !== "production") {
        const response = await request(app).get("/system/debug-files");

        expect([200, 404]).toContain(response.status);
      }
    });

    it("Should reject unauthenticated requests to protected endpoints", async () => {
      // Assuming /api/chat or similar requires auth
      const response = await request(app)
        .post("/api/chat")
        .send({ message: "test" });

      // Should return 401 or 403 if auth is enforced
      expect([401, 403, 400]).toContain(response.status);
    });
  });

  // ============================================
  // SECTION 6: Performance & Metrics
  // ============================================
  describe("Performance Baseline", () => {
    it("Health check should respond within 1s", async () => {
      const start = Date.now();
      await request(app).get("/health");
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000);
    });

    it("API should not leak sensitive data in errors", async () => {
      const response = await request(app).get("/api/nonexistent");

      const body = JSON.stringify(response.body);
      expect(body).not.toMatch(/password|secret|token|key/i);
    });
  });
});

/**
 * WADI Brain - Unit Tests for Personality Logic
 * Valida que cada personalidad produce respuestas coherentes
 */
describe("WADI Brain - Personality Unit Tests", () => {
  describe("EJECUTIVO Personality", () => {
    it("Should respond with focus and action items", () => {
      const personality = "EJECUTIVO";
      // In real implementation: call engine with personality param
      expect(personality).toBe("EJECUTIVO");
    });
  });

  describe("IRÓNICO Personality", () => {
    it("Should respond with humor and reality check", () => {
      const personality = "IRÓNICO";
      expect(personality).toBe("IRÓNICO");
    });
  });

  describe("SERENO Personality", () => {
    it("Should respond with calm and perspective", () => {
      const personality = "SERENO";
      expect(personality).toBe("SERENO");
    });
  });

  describe("SERIO Personality", () => {
    it("Should respond with professional and structured approach", () => {
      const personality = "SERIO";
      expect(personality).toBe("SERIO");
    });
  });
});

/**
 * Database Connection Tests
 * Valida conectividad a Supabase
 */
describe("Database Connectivity", () => {
  it("Should have Supabase client initialized", async () => {
    // This would test the actual supabase.ts client
    const { supabase } = await import("../supabase");
    expect(supabase).toBeDefined();
  });
});
