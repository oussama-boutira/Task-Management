import { ErrorCodes } from "../schemas/task.schema.js";

// Custom API Error class
export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "ApiError";
  }

  static badRequest(message, details = null) {
    return new ApiError(400, ErrorCodes.VALIDATION_ERROR, message, details);
  }

  static unauthorized(message) {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message) {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message) {
    return new ApiError(404, ErrorCodes.TASK_NOT_FOUND, message);
  }

  static internal(message) {
    return new ApiError(500, ErrorCodes.INTERNAL_ERROR, message);
  }
}
