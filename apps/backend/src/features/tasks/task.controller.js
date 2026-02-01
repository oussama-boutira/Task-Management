import { taskService } from "./task.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Task controller - route handlers
export const taskController = {
  // GET /tasks - List all tasks
  async getAllTasks(req, res, next) {
    try {
      const { tasks, total } = await taskService.getAllTasks(req.user);
      return ApiResponse.success(res, tasks, { total });
    } catch (error) {
      next(error);
    }
  },

  // GET /tasks/:id - Get single task
  async getTaskById(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const task = await taskService.getTaskById(id, req.user);
      return ApiResponse.success(res, task);
    } catch (error) {
      next(error);
    }
  },

  // POST /tasks - Create task
  async createTask(req, res, next) {
    try {
      const task = await taskService.createTask(req.validatedBody);
      return ApiResponse.created(res, task);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /tasks/:id - Update task
  async updateTask(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const task = await taskService.updateTask(id, req.validatedBody);
      return ApiResponse.success(res, task);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /tasks/:id - Delete task
  async deleteTask(req, res, next) {
    try {
      const { id } = req.validatedParams;
      const result = await taskService.deleteTask(id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
