import { describe, it, expect, vi } from "vitest";

// 1. Mock Supabase BEFORE any imports
vi.mock("../../supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
          single: vi.fn().mockResolvedValue({ data: { id: "p1", name: "Test", user_id: "u1" }, error: null }),
          neq: vi.fn().mockResolvedValue({ data: [], error: null })
        }),
        single: vi.fn().mockResolvedValue({ data: { id: "p1", name: "Test", user_id: "u1" }, error: null })
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "p-new", status: "GENERATING_STRUCTURE" }, error: null })
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: { id: "p1", status: "READY" }, error: null })
        })
      }),
      delete: vi.fn().mockReturnValue({
        in: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ error: null })
        })
      })
    }),
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", user_metadata: { scopes: ["admin:*"] } } }, error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: { access_token: "fake-token" } }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", user_metadata: { naturalness_level: 8, active_persona: "IRONICO" } } }, error: null })
    }
  }
}));

// 2. Mock LLM and Services
vi.mock("../../wadi-brain", () => ({
  generateCrystallizeStructure: vi.fn(() => Promise.resolve({
    problem: "p",
    solution: "s",
    target_icp: "i",
    value_proposition: "v",
    recommended_stack: "st",
    milestones: ["m1", "m2", "m3"],
    risks: ["r1", "r2", "r3"],
    validation_steps: ["v1", "v2", "v3"]
  })),
  CRYSTALLIZE_PROMPT_VERSION: 1,
  runBrainStream: vi.fn(() => Promise.resolve({ stream: {}, personaId: "p1" })),
  generateSystemPrompt: vi.fn(() => ({ prompt: "p", decision: "d" }))
}));

vi.mock("../../services/cognitive-service", () => ({
  getGlobalPromptAdjustments: vi.fn().mockResolvedValue(""),
  runDailySnapshot: vi.fn().mockResolvedValue({}),
  getCognitiveProfileSummary: vi.fn().mockResolvedValue("mocked summary"),
  updateCognitiveProfile: vi.fn().mockResolvedValue({}),
  logProjectEdit: vi.fn().mockResolvedValue({}),
  runGlobalMetaAnalysis: vi.fn().mockResolvedValue({})
}));

vi.mock("../../middleware/rateLimiter", () => ({
  rateLimiter: (req: any, res: any, next: any) => next(),
  expensiveRateLimiter: (req: any, res: any, next: any) => next(),
  adminRateLimiter: (req: any, res: any, next: any) => next(),
  globalBudgetGuard: (req: any, res: any, next: any) => next(),
  incrementGlobalBudget: vi.fn()
}));

vi.mock("../../services/knowledge-service", () => ({
  getRelevantKnowledge: vi.fn().mockResolvedValue([])
}));

import request from "supertest";
import { app } from "../../index";

describe("Project Full Flow Integration Test", () => {
  const token = "Bearer fake-token";

  it("should list projects for authenticated user", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", token);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should create a project and start crystallization", async () => {
    const res = await request(app)
      .post("/api/projects/crystallize")
      .set("Authorization", token)
      .send({
        name: "New Project",
        description: "This is a test project with enough length to pass validation."
      });

    expect(res.status).toBe(201);
    expect(res.body.project.status).toBe("GENERATING_STRUCTURE");
  });

  it("should update user preferences with validation", async () => {
    const res = await request(app)
      .patch("/api/user/preferences")
      .set("Authorization", token)
      .send({
        naturalness_level: 8,
        active_persona: "IRONICO"
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Preferences updated");
  });

  it("should reject invalid user preferences", async () => {
    const res = await request(app)
      .patch("/api/user/preferences")
      .set("Authorization", token)
      .send({
        naturalness_level: 99 // Invalid: max is 10
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("VALIDATION_ERROR");
  });
});
