// Standardized API response helper
export class ApiResponse {
  static success(res, data, meta = null, statusCode = 200) {
    const response = {
      success: true,
      data,
    };
    if (meta) {
      response.meta = meta;
    }
    return res.status(statusCode).json(response);
  }

  static created(res, data) {
    return ApiResponse.success(res, data, null, 201);
  }

  static error(res, error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.code || "INTERNAL_ERROR",
        message: error.message || "An unexpected error occurred",
        details: error.details || null,
      },
    });
  }
}
