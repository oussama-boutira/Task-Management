import jwt from "jsonwebtoken";
import { userRepository } from "../features/auth/user.repository.js";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Authenticate middleware - verify JWT token
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required. Please provide a valid token.",
        },
      });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Fetch user from database to ensure they still exist
      const user = await userRepository.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User no longer exists.",
          },
        });
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token.",
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// Require admin role middleware
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "Admin access required.",
      },
    });
  }
  next();
};

// Optional auth middleware - attach user if token present, but don't require it
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await userRepository.findById(decoded.id);
        if (user) {
          req.user = user;
        }
      } catch (jwtError) {
        // Token invalid, but that's okay for optional auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
