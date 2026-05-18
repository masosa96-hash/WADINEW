import { Router } from "express";
import swaggerUi from "swagger-ui-express";

const router = Router();

const swaggerSpec = {
  openapi: "3.0.1",
  info: {
    title: "WADI API",
    version: "5.1.0",
    description: "WADI AI Co-Founder API documentation.",
    contact: {
      name: "WADI Team",
      email: "support@wadi.ai",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "error" },
          requestId: { type: "string", example: "550e8400-e29b-41d4-a716-446655440000" },
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "INVALID_INPUT" },
              message: { type: "string", example: "Validation failed" },
              details: { type: "object" },
            },
          },
        },
      },
      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "healthy" },
          timestamp: { type: "string", example: "2026-05-17T12:00:00.000Z" },
          checks: {
            type: "object",
            properties: {
              api: { type: "string", example: "ok" },
              database: { type: "string", example: "ok" },
              environment: { type: "string", example: "ok" },
            },
          },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Check full service health",
        responses: {
          "200": {
            description: "Service health status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
          "503": {
            description: "Service degraded or unhealthy",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/health/live": {
      get: {
        tags: ["Health"],
        summary: "Liveness probe for the service",
        responses: {
          "200": {
            description: "Process is alive",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    alive: { type: "boolean", example: true },
                    timestamp: { type: "string", example: "2026-05-17T12:00:00.000Z" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/health/ready": {
      get: {
        tags: ["Health"],
        summary: "Readiness probe for service traffic",
        responses: {
          "200": {
            description: "Service is ready to receive traffic",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ready: { type: "boolean", example: true },
                    timestamp: { type: "string", example: "2026-05-17T12:00:00.000Z" },
                  },
                },
              },
            },
          },
          "503": {
            description: "Service is not ready",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/projects": {
      get: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "List projects for authenticated user",
        responses: {
          "200": {
            description: "List of projects",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { type: "object" },
                },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/projects/{id}": {
      get: {
        tags: ["Projects"],
        security: [{ bearerAuth: [] }],
        summary: "Retrieve a single project by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Project details",
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          "404": {
            description: "Project not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
router.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));

export default router;
