/**
 * Standardized Application Errors
 * Provides consistent error handling across client and server
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, "VALIDATION_ERROR", details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized access") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden: Insufficient role permissions") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const msg = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(msg, 404, "NOT_FOUND");
  }
}

export function formatErrorResponse(error: unknown) {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    };
  }

  const err = error as Error;
  return {
    success: false,
    error: {
      code: "UNKNOWN_ERROR",
      message: err?.message || "An unexpected error occurred",
    },
  };
}
