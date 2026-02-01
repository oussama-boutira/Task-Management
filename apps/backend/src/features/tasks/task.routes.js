import { Router } from "express";
import { taskController } from "./task.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import { authenticate, requireAdmin } from "../../middleware/authMiddleware.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from "../../schemas/task.schema.js";

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET /tasks - List all tasks (admin sees all, user sees their own)
router.get("/", taskController.getAllTasks);

// GET /tasks/:id - Get single task
router.get(
  "/:id",
  validateRequest(taskIdSchema, "params"),
  taskController.getTaskById,
);

// POST /tasks - Create task (admin only)
router.post(
  "/",
  requireAdmin,
  validateRequest(createTaskSchema, "body"),
  taskController.createTask,
);

// PATCH /tasks/:id - Update task (admin only)
router.patch(
  "/:id",
  requireAdmin,
  validateRequest(taskIdSchema, "params"),
  validateRequest(updateTaskSchema, "body"),
  taskController.updateTask,
);

// DELETE /tasks/:id - Delete task (admin only)
router.delete(
  "/:id",
  requireAdmin,
  validateRequest(taskIdSchema, "params"),
  taskController.deleteTask,
);

export const taskRoutes = router;
