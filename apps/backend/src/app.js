import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { taskRoutes } from "./features/tasks/index.js";
import { errorHandler } from "./middleware/index.js";
import { API_BASE_PATH } from "./schemas/task.schema.js";

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use(`${API_BASE_PATH}/tasks`, taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Global error handler
app.use(errorHandler);

export { app };
