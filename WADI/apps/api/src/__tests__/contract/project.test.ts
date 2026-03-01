import request from "supertest";
import { describe, it, expect, vi } from "vitest";

// 1. Mock Auth
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

// 2. Mock Supabase
const { mockSupabase } = vi.hoisted(() => {
  const mockProject = {
    id: "proj-123",
    user_id: "test-user-id",
    name: "Test Project",
    description: "A test project description",
    status: "READY",
    structure: {
      problem: "P",
      solution: "S",
      target_icp: "I",
      value_proposition: "V",
      recommended_stack: "R",
      milestones: ["M1", "M2", "M3"],
      risks: ["R1", "R2", "R3"],
      validation_steps: ["V1", "V2", "V3"],
      terminal_commands: ["pnpm intall", "pnpm dev"],
      orientation: "technical",
    },
    prd: "Mocked PRD Content",
    created_at: new Date().toISOString()
  };

  return {
    mockSupabase: {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockProject, error: null }),
      update: vi.fn().mockReturnThis(),
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "test-user-id" } }, error: null })
      }
    }
  };
});

vi.mock("../../supabase", () => ({
  supabase: mockSupabase
}));

// 3. Mock WADI Brain PRD Generator
vi.mock("../../wadi-brain", async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    generateProjectPRD: vi.fn().mockResolvedValue("Newly Generated Based PRD"),
  };
});

// Import app after mocks
import { app } from "../../index";

describe("WADI v1.1 Feature Tests", () => {
  
  describe("GET /api/projects/:id/export", () => {
    it("should export project as markdown by default", async () => {
      const res = await request(app)
        .get("/api/projects/proj-123/export")
        .set("Authorization", "Bearer valid_token");

      if (res.status !== 200) console.error("GET EXPORT ERROR:", res.body?.error?.message);
      expect(res.status).toBe(200);
      expect(res.header["content-type"]).toContain("text/markdown");
      expect(res.text).toContain("# Test Project");
      expect(res.text).toContain("Mocked PRD Content");
      expect(res.text).toContain("pnpm intall");
    });

    it("should export project as JSON when format=json", async () => {
      const res = await request(app)
        .get("/api/projects/proj-123/export?format=json")
        .set("Authorization", "Bearer valid_token");

      if (res.status !== 200) console.error("GET JSON ERROR:", res.body?.error?.message);
      expect(res.status).toBe(200);
      expect(res.header["content-type"]).toContain("application/json");
      expect(res.body.name).toBe("Test Project");
      expect(res.body.structure.orientation).toBe("technical");
    });

    it("should return 401 without auth", async () => {
      const res = await request(app).get("/api/projects/proj-123/export");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/projects/:id/prd", () => {
    it("should return existing PRD if available", async () => {
      const res = await request(app)
        .post("/api/projects/proj-123/prd")
        .set("Authorization", "Bearer valid_token");

      if (res.status !== 200) console.error("POST PRD ERROR:", res.body?.error?.message);
      expect(res.status).toBe(200);
      expect(res.body.prd).toBe("Mocked PRD Content");
      // ensure update was not called because it returned existing
      expect(mockSupabase.update).not.toHaveBeenCalled();
    });

    it("should force generate new PRD if ?force=true", async () => {
      const res = await request(app)
        .post("/api/projects/proj-123/prd?force=true")
        .set("Authorization", "Bearer valid_token");

      if (res.status !== 200) console.error("POST PRD FORCE ERROR:", res.body?.error?.message);
      expect(res.status).toBe(200);
      expect(res.body.prd).toBe("Newly Generated Based PRD");
      expect(mockSupabase.update).toHaveBeenCalled();
    });
  });

});
