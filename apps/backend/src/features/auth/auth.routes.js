import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateBody } from "../../middleware/validateRequest.js";
import {
  registerSchema,
  loginSchema,
  updateUserSchema,
} from "./auth.schema.js";
import { authenticate, requireAdmin } from "../../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

// Protected routes
router.get("/me", authenticate, authController.getProfile);

// Admin-only routes
router.get("/users", authenticate, requireAdmin, authController.getAllUsers);
router.patch(
  "/users/:id",
  authenticate,
  requireAdmin,
  validateBody(updateUserSchema),
  authController.updateUser,
);
router.delete(
  "/users/:id",
  authenticate,
  requireAdmin,
  authController.deleteUser,
);

export { router as authRoutes };
