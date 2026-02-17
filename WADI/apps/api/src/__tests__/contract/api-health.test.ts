import request from "supertest";
import { describe, it, expect, vi, beforeAll } from "vitest";

// MOCKS MUST BE DEFINED BEFORE IMPORTING APP
vi.mock("../../middleware/auth-beta", () => ({
  authenticate: () => (req: any, res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === "Bearer valid_token") {
      req.user = { id: "test-user-id" };
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  },
}));

// Mock LLM Stream
vi.mock("../../wadi-brain", () => ({
  runBrainStream: async function* () {
    yield { choices: [{ delta: { content: "Hello" } }], usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 } };
    yield { choices: [{ delta: { content: " World" } }] };
  },
}));

// Now import app
import { app } from "../../index";

describe("API Contract Smoke Tests", () => {
  it("GET /health should return 200 OK", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "WADI ONLINE" });
  });

  it("POST /api/projects/1/runs without auth should return 401", async () => {
    const res = await request(app).post("/api/projects/1/runs").send({ input: "test" });
    expect(res.status).toBe(401);
  });

  it("POST /api/projects/1/runs with valid auth should return 200 Stream", async () => {
    const res = await request(app)
      .post("/api/projects/1/runs")
      .set("Authorization", "Bearer valid_token")
      .send({ input: "test", model: "fast" }); // Added model just in case

    expect(res.status).toBe(200);
    expect(res.header["content-type"]).toMatch(/text\/event-stream/);
    
    // Verify stream content contains "Hello World" and usage logic triggers
    // Note: supertest accumulates stream body in res.text usually
    expect(res.text).toContain('data: {"content":"Hello"}');
    expect(res.text).toContain('data: {"content":" World"}');
    expect(res.text).toContain('data: [DONE]');
  });
});
