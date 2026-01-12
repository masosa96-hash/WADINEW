import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProjectsService } from "../project.service";
import { ProjectStatus } from "@wadi/core";

const {
  mockSupabase,
  mockSelect,
  mockInsert,
  mockUpdate,
  mockDelete,
  mockEq,
  mockOrder,
  mockSingle,
} = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockUpdate = vi.fn();
  const mockDelete = vi.fn();
  const mockEq = vi.fn();
  const mockOrder = vi.fn();
  const mockSingle = vi.fn();

  // Chainable mocks setup
  const returnChain = { eq: mockEq, order: mockOrder, single: mockSingle, select: mockSelect };
  
  mockSelect.mockReturnValue(returnChain);
  mockInsert.mockReturnValue({ select: mockSelect });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockDelete.mockReturnValue({ eq: mockEq });
  mockEq.mockReturnValue(returnChain);
  mockOrder.mockReturnValue({ data: [], error: null });
  mockSingle.mockReturnValue({ data: null, error: null });

  const mockSupabase = {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
  };

  return {
    mockSupabase,
    mockSelect,
    mockInsert,
    mockUpdate,
    mockDelete,
    mockEq,
    mockOrder,
    mockSingle,
  };
});

// Mock the module
vi.mock("../../../supabase", () => ({
  supabase: mockSupabase,
}));

describe("ProjectsService", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default behaviors if needed, as vi.hoisted mocks persist
    mockOrder.mockReturnValue({ data: [], error: null });
    mockSingle.mockReturnValue({ data: null, error: null });
  });

  describe("create", () => {
    it("should create a project with default status PLANNING", async () => {
      const input = { name: "New Project", description: "Desc" };
      const mockProject = {
        id: "p1",
        user_id: userId,
        ...input,
        status: ProjectStatus.PLANNING,
        created_at: new Date().toISOString(),
      };

      // Mock specific chain for create
      mockSelect.mockReturnValueOnce({ single: mockSingle }); // insert(...).select()
      mockSingle.mockReturnValueOnce({ data: mockProject, error: null });

      const result = await ProjectsService.create(userId, input);

      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockInsert).toHaveBeenCalledWith({
        user_id: userId,
        name: input.name,
        description: input.description,
        status: ProjectStatus.PLANNING,
      });
      expect(result).toEqual(mockProject);
    });

    it("should throw error if creation fails", async () => {
        // Setup mocks for failure
        mockSelect.mockReturnValueOnce({ single: mockSingle });
        mockSingle.mockReturnValueOnce({ data: null, error: { message: "DB Error" } });
  
        await expect(ProjectsService.create(userId, { name: "Fail", description: "Fail description" })).rejects.toThrow("DB Error");
      });
  });

  describe("list", () => {
    it("should return list of projects", async () => {
      const mockProjects = [{ id: "p1", name: "P1" }];
      mockOrder.mockReturnValueOnce({ data: mockProjects, error: null });

      const result = await ProjectsService.list(userId);

      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockSelect).toHaveBeenCalledWith("*");
      expect(mockEq).toHaveBeenCalledWith("user_id", userId);
      expect(result).toEqual(mockProjects);
    });
  });
});
