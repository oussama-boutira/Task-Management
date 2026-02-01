import { Router } from "express";
import { authController } from "./auth.controller.js";
import { validateBody } from "../../middleware/validateRequest.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { authenticate, requireAdmin } from "../../middleware/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

// Protected routes
router.get("/me", authenticate, authController.getProfile);
router.get("/users", authenticate, requireAdmin, authController.getAllUsers);

export { router as authRoutes };
