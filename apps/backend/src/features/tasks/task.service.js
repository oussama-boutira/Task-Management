import { taskRepository } from "./task.repository.js";
import { ApiError } from "../../utils/ApiError.js";

// Task service - business logic
export const taskService = {
  // Get all tasks (admin sees all, user sees their own)
  async getAllTasks(user) {
    let tasks, total;

    if (user.role === "admin") {
      tasks = await taskRepository.findAll();
      total = await taskRepository.count();
    } else {
      tasks = await taskRepository.findByUserId(user.id);
      total = await taskRepository.countByUserId(user.id);
    }

    return { tasks, total };
  },

  // Get task by ID
  async getTaskById(id, user) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task with id '${id}' not found`);
    }

    // Non-admin users can only see their own tasks
    if (user.role !== "admin" && task.userId !== user.id) {
      throw ApiError.forbidden("You do not have permission to view this task");
    }

    return task;
  },

  // Create new task (admin only)
  async createTask(data) {
    return await taskRepository.create(data);
  },

  // Update task (admin only)
  async updateTask(id, data) {
    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw ApiError.notFound(`Task with id '${id}' not found`);
    }

    return await taskRepository.update(id, data);
  },

  // Delete task (admin only)
  async deleteTask(id) {
    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw ApiError.notFound(`Task with id '${id}' not found`);
    }

    await taskRepository.delete(id);
    return { id, message: "Task deleted successfully" };
  },
};
