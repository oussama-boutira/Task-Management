import { authService } from "./auth.service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

// Auth controller - route handlers
export const authController = {
  // POST /auth/register - Register new user
  async register(req, res, next) {
    try {
      const result = await authService.register(req.validatedBody);
      return ApiResponse.created(res, result);
    } catch (error) {
      next(error);
    }
  },

  // POST /auth/login - Login user
  async login(req, res, next) {
    try {
      const { email, password } = req.validatedBody;
      const result = await authService.login(email, password);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },

  // GET /auth/me - Get current user profile
  async getProfile(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  // GET /auth/users - Get all users (admin only)
  async getAllUsers(req, res, next) {
    try {
      const users = await authService.getAllUsers();
      return ApiResponse.success(res, users);
    } catch (error) {
      next(error);
    }
  },

  // PATCH /auth/users/:id - Update user (admin only)
  async updateUser(req, res, next) {
    try {
      const user = await authService.updateUser(
        req.params.id,
        req.validatedBody,
        req.user.id,
      );
      return ApiResponse.success(res, user);
    } catch (error) {
      next(error);
    }
  },

  // DELETE /auth/users/:id - Delete user (admin only)
  async deleteUser(req, res, next) {
    try {
      const result = await authService.deleteUser(req.params.id, req.user.id);
      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  },
};
