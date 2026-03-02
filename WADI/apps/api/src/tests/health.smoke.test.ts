import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("API Health Smoke Test", () => {
  it("should return 200 OK for /api/health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toContain("WADI ONLINE");
  });

  it("should return 404 with standard format for non-existent routes", async () => {
    const response = await request(app).get("/api/not-found-really");
    expect(response.status).toBe(404);
    expect(response.body.error).toBeDefined();
    // In our implementation, standard unknown /api routes fall down to the API 404 handler
    // which generates the standard JSON format.
  });
});
