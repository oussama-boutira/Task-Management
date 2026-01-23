import { Router } from "express";
import { taskController } from "./task.controller.js";
import { validateRequest } from "../../middleware/validateRequest.js";
import {
  createTaskSchema,
  updateTaskSchema,
  taskIdSchema,
} from "../../schemas/task.schema.js";

const router = Router();

// GET /tasks - List all tasks
router.get("/", taskController.getAllTasks);

// GET /tasks/:id - Get single task
router.get(
  "/:id",
  validateRequest(taskIdSchema, "params"),
  taskController.getTaskById,
);

// POST /tasks - Create task
router.post(
  "/",
  validateRequest(createTaskSchema, "body"),
  taskController.createTask,
);

// PATCH /tasks/:id - Update task
router.patch(
  "/:id",
  validateRequest(taskIdSchema, "params"),
  validateRequest(updateTaskSchema, "body"),
  taskController.updateTask,
);

// DELETE /tasks/:id - Delete task
router.delete(
  "/:id",
  validateRequest(taskIdSchema, "params"),
  taskController.deleteTask,
);

export const taskRoutes = router;
