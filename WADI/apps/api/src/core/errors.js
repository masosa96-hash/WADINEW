export class AppError extends Error {
  constructor(code, message, status = 500) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests") {
    super("RATE_LIMIT", message, 429);
  }
}

export class AuthError extends AppError {
  constructor(message = "Authentication required") {
    super("AUTH_ERROR", message, 401);
  }
}

export class RlsError extends AppError {
  constructor(message = "Access denied") {
    super("RLS_DENIED", message, 403);
  }
}

export class ModelError extends AppError {
  constructor(message = "AI Model Error") {
    super("MODEL_ERROR", message, 502);
  }
}
