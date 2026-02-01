const API_BASE_URL = "/api/v1";

// Auth API functions
export const authApi = {
  // Register new user
  async register(name, email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Registration failed");
    }

    return data;
  },

  // Login user
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Login failed");
    }

    return data;
  },

  // Get current user profile
  async getProfile(token) {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get profile");
    }

    return data;
  },

  // Get all users (admin only)
  async getAllUsers(token) {
    const response = await fetch(`${API_BASE_URL}/auth/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Failed to get users");
    }

    return data;
  },
};
