import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userRepository } from "./user.repository.js";
import { config } from "../../config/index.js";

// JWT secret from environment or default
const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

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
};
