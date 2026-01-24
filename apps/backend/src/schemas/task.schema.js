import { z } from "zod";

// Task status values
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

// Zod Schemas
export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  status: z.enum(["pending", "in_progress", "completed"]).default("pending"),
  deadline: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be 255 characters or less")
    .optional(),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional(),
  status: z.enum(["pending", "in_progress", "completed"]).optional(),
  deadline: z.string().datetime().optional().nullable(),
});

export const taskIdSchema = z.object({
  id: z.string().uuid("Invalid task ID format"),
});

// Constants
export const TASK_TITLE_MAX_LENGTH = 255;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;
export const API_VERSION = "v1";
export const API_BASE_PATH = `/api/${API_VERSION}`;

export const ErrorCodes = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  TASK_NOT_FOUND: "TASK_NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};
