import { Request, Response, NextFunction } from "express";

interface ErrorResponseBody {
  status: "error";
  requestId?: string;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function responseFormatter(req: Request, res: Response, next: NextFunction) {
  const originalJson = res.json.bind(res);

  res.json = (body?: any) => {
    if (res.headersSent) {
      return originalJson(body);
    }

    if (res.statusCode >= 400) {
      const requestId = (req as any).requestId as string | undefined;
      const normalized = normalizeErrorResponse(body, requestId);
      res.setHeader("X-Request-ID", requestId || "");
      return originalJson(normalized);
    }

    if (!res.getHeader("X-Request-ID") && (req as any).requestId) {
      res.setHeader("X-Request-ID", (req as any).requestId);
    }

    return originalJson(body);
  };

  next();
}

function normalizeErrorResponse(body: any, requestId?: string): ErrorResponseBody {
  const defaultMessage = "Unexpected error";

  const message =
    typeof body?.message === "string"
      ? body.message
      : typeof body?.error === "string"
        ? body.error
        : typeof body?.error?.message === "string"
          ? body.error.message
          : defaultMessage;

  const code = typeof body?.code === "string"
    ? body.code
    : typeof body?.error?.code === "string"
      ? body.error.code
      : "UNKNOWN_ERROR";

  const details = body?.details ?? body?.meta ?? (body?.error?.details ?? body?.error?.meta);

  return {
    status: "error",
    requestId,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
