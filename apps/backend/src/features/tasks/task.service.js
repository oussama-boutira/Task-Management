import { taskRepository } from "./task.repository.js";
import { ApiError } from "../../utils/ApiError.js";

// Task service - business logic
export const taskService = {
  // Get all tasks
  async getAllTasks() {
    const tasks = await taskRepository.findAll();
    const total = await taskRepository.count();
    return { tasks, total };
  },

  // Get task by ID
  async getTaskById(id) {
    const task = await taskRepository.findById(id);
    if (!task) {
      throw ApiError.notFound(`Task with id '${id}' not found`);
    }
    return task;
  },

  // Create new task
  async createTask(data) {
    return await taskRepository.create(data);
  },

  // Update task
  async updateTask(id, data) {
    // Check if task exists
    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      throw ApiError.notFound(`Task with id '${id}' not found`);
    }

    return await taskRepository.update(id, data);
  },

  // Delete task
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
