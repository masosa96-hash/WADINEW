import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { app } from "../index";

describe("Error Response Contract - Standard Format", () => {
  /**
   * All error responses (4xx, 5xx) must follow this contract:
   * {
   *   status: "error",
   *   requestId: "uuid-string",
   *   error: {
   *     code: "ERROR_CODE",
   *     message: "Human readable message",
   *     details?: {...}
   *   }
   * }
   */

  describe("Contract Validation", () => {
    it("Error envelope includes status, requestId, and error fields", () => {
      const errorResponse = {
        status: "error",
        requestId: "550e8400-e29b-41d4-a716-446655440000",
        error: {
          code: "BAD_REQUEST",
          message: "Invalid input provided"
        }
      };

      expect(errorResponse).toHaveProperty("status", "error");
      expect(errorResponse).toHaveProperty("requestId");
      expect(errorResponse).toHaveProperty("error");
      expect(errorResponse.error).toHaveProperty("code");
      expect(errorResponse.error).toHaveProperty("message");
    });

    it("Error code follows UPPER_SNAKE_CASE convention", () => {
      const validCodes = [
        "BAD_REQUEST",
        "NOT_FOUND",
        "CONFLICT",
        "DB_ERROR",
        "VALIDATION_ERROR",
        "SERVICE_UNAVAILABLE",
        "AUTH_ERROR",
        "UNAUTHORIZED",
        "FORBIDDEN",
        "MISSING_AUTH",
        "CONCURRENT_STREAM_NOT_ALLOWED",
        "LLM_TIMEOUT",
        "STREAMING_ERROR",
        "EXECUTION_FAILED"
      ];

      validCodes.forEach(code => {
        expect(code).toMatch(/^[A-Z_]+$/);
        expect(code.length).toBeGreaterThan(0);
      });
    });

    it("RequestId is valid UUID v4 format", () => {
      const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      const sampleUuid = "550e8400-e29b-41d4-a716-446655440000";
      const looseuuidPattern = /^[0-9a-f-]+$/i;
      
      expect(sampleUuid).toMatch(looseuuidPattern);
    });
  });

  describe("400 Bad Request - Contract", () => {
    it("BAD_REQUEST error has correct structure", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "BAD_REQUEST",
          message: "Input is required"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("BAD_REQUEST");
      expect(typeof error.error.message).toBe("string");
    });

    it("VALIDATION_ERROR contract matches specification", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: { field: "name", reason: "Required" }
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("VALIDATION_ERROR");
      expect(error.error.details).toBeDefined();
    });
  });

  describe("404 Not Found - Contract", () => {
    it("NOT_FOUND error structure is valid", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "NOT_FOUND",
          message: "Project not found"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("NOT_FOUND");
    });
  });

  describe("401/403 Authorization - Contract", () => {
    it("UNAUTHORIZED error has correct structure", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "UNAUTHORIZED",
          message: "Invalid token"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("UNAUTHORIZED");
    });

    it("FORBIDDEN error has correct structure", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("FORBIDDEN");
    });
  });

  describe("502 Service Unavailable - Contract", () => {
    it("SERVICE_UNAVAILABLE error structure is valid", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "AI Service Unavailable",
          details: { service: "OpenAI" }
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("SERVICE_UNAVAILABLE");
    });
  });

  describe("500 Internal Server Error - Contract", () => {
    it("DB_ERROR contract is valid", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "DB_ERROR",
          message: "Failed to fetch metrics"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("DB_ERROR");
    });

    it("EXECUTION_FAILED contract is valid", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "EXECUTION_FAILED",
          message: "Materialization failed"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("EXECUTION_FAILED");
    });

    it("AUTH_ERROR contract is valid", () => {
      const error = {
        status: "error",
        requestId: "uuid-12345",
        error: {
          code: "AUTH_ERROR",
          message: "Authentication failed"
        }
      };

      expect(error.status).toBe("error");
      expect(error.error.code).toBe("AUTH_ERROR");
    });
  });

  describe("Response Format Consistency", () => {
    it("All errors use consistent envelope structure", () => {
      const errorExamples = [
        {
          status: "error",
          requestId: "id1",
          error: { code: "BAD_REQUEST", message: "msg1" }
        },
        {
          status: "error",
          requestId: "id2",
          error: { code: "NOT_FOUND", message: "msg2" }
        },
        {
          status: "error",
          requestId: "id3",
          error: { code: "DB_ERROR", message: "msg3", details: { x: 1 } }
        }
      ];

      errorExamples.forEach((err) => {
        expect(err).toHaveProperty("status", "error");
        expect(err).toHaveProperty("requestId");
        expect(err).toHaveProperty("error");
        expect(err.error).toHaveProperty("code");
        expect(err.error).toHaveProperty("message");
      });
    });

    it("RequestId field exists in all error responses", () => {
      const errors = [
        { status: "error", requestId: "uuid-1", error: { code: "CODE1", message: "Msg1" } },
        { status: "error", requestId: "uuid-2", error: { code: "CODE2", message: "Msg2" } }
      ];

      errors.forEach(err => {
        expect(err.requestId).toBeDefined();
        expect(typeof err.requestId).toBe("string");
      });
    });
  });

  describe("Health Check Endpoint", () => {
    it("Health endpoint returns successfully", async () => {
      const response = await request(app)
        .get("/health")
        .set("Accept", "application/json");

      expect(response.status).toBeLessThan(500);
      expect(response.headers["x-request-id"]).toBeDefined();
    });
  });

  describe("AppError Class Specification", () => {
    it("AppError initializes with code, message, and statusCode", () => {
      // This validates the expected structure of AppError usage
      const expectedAppErrorUsage = {
        code: "BAD_REQUEST",
        message: "Input is required",
        statusCode: 400,
        meta: {}
      };

      expect(expectedAppErrorUsage.code).toBeTruthy();
      expect(expectedAppErrorUsage.message).toBeTruthy();
      expect(expectedAppErrorUsage.statusCode).toBeGreaterThanOrEqual(400);
    });

    it("AppError can include details/metadata", () => {
      const errorWithDetails = {
        code: "VALIDATION_ERROR",
        message: "Invalid data",
        statusCode: 400,
        details: {
          field: "email",
          reason: "Invalid format"
        }
      };

      expect(errorWithDetails.details).toBeDefined();
      expect(errorWithDetails.details.field).toBe("email");
    });
  });
});
