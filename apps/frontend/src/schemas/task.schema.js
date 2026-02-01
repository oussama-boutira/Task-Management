import { z } from "zod";

// Task status values
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  PENDING_REVIEW: "pending_review",
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
  status: z
    .enum(["pending", "in_progress", "pending_review", "completed"])
    .default("pending"),
  deadline: z.string().datetime().optional(),
  userId: z.string().uuid("Invalid user ID format").optional().nullable(),
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
  status: z
    .enum(["pending", "in_progress", "pending_review", "completed"])
    .optional(),
  deadline: z.string().datetime().optional().nullable(),
  userId: z.string().uuid("Invalid user ID format").optional().nullable(),
});

// Constants
export const TASK_TITLE_MAX_LENGTH = 255;
export const TASK_DESCRIPTION_MAX_LENGTH = 2000;
