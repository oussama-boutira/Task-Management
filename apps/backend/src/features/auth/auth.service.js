import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "./user.repository.js";

// JWT secret from environment or default
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

// Auth service - authentication business logic
export const authService = {
  // Generate JWT token
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN },
    );
  },

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  },

  // Register new user
  async register(userData) {
    // Check if user already exists
    const existingUser = await userRepository.findByEmail(userData.email);
    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.statusCode = 409;
      error.code = "EMAIL_EXISTS";
      throw error;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await userRepository.create({
      name: userData.name,
      email: userData.email,
      passwordHash,
      role: "user", // Always register as regular user
    });

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  // Login user
  async login(email, password) {
    // Find user by email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      error.code = "INVALID_CREDENTIALS";
      throw error;
    }

    // Generate token
    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  },

  // Get user profile
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }
    return user;
  },

  // Get all users (for admin)
  async getAllUsers() {
    return userRepository.findAll();
  },

  // Update user (admin only)
  async updateUser(userId, updateData, currentUserId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // Prevent demoting the last admin
    if (updateData.role === "user" && user.role === "admin") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        const error = new Error("Cannot demote the last admin");
        error.statusCode = 400;
        error.code = "LAST_ADMIN";
        throw error;
      }
    }

    const updatedUser = await userRepository.update(userId, updateData);
    return updatedUser;
  },

  // Delete user (admin only)
  async deleteUser(userId, currentUserId) {
    // Prevent self-deletion
    if (userId === currentUserId) {
      const error = new Error("Cannot delete your own account");
      error.statusCode = 400;
      error.code = "SELF_DELETE";
      throw error;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      error.code = "USER_NOT_FOUND";
      throw error;
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await userRepository.countAdmins();
      if (adminCount <= 1) {
        const error = new Error("Cannot delete the last admin");
        error.statusCode = 400;
        error.code = "LAST_ADMIN";
        throw error;
      }
    }

    await userRepository.delete(userId);
    return { id: userId };
  },
};
