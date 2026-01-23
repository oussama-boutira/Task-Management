import { ApiError } from "../utils/ApiError.js";

// Zod validation middleware factory
export const validateRequest = (schema, source = "body") => {
  return (req, res, next) => {
    const dataToValidate = source === "params" ? req.params : req.body;
    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return next(ApiError.badRequest("Validation failed", details));
    }

    // Attach validated data to request
    if (source === "params") {
      req.validatedParams = result.data;
    } else {
      req.validatedBody = result.data;
    }

    next();
  };
};
