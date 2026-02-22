import { describe, it, expect } from "vitest";

// Note: In a real scenario, we might import the whole app, 
// but for a smoke test we can test the running server.
const API_URL = process.env.VITE_API_URL || "http://localhost:3000";

describe("API Health Smoke Test", () => {
  it("should return 200 OK for /api/health", async () => {
    const response = await fetch(`${API_URL}/api/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toContain("WADI ONLINE");
  });

  it("should return 404 with standard format for non-existent routes", async () => {
    const response = await fetch(`${API_URL}/api/not-found-really`);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.status).toBe("error");
    expect(data.error.code).toBeDefined();
  });
});
