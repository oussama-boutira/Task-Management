const API_BASE_URL = "/api/v1";

// Get token from localStorage (where Zustand persists it)
function getAuthToken() {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch {
    return null;
  }
  return null;
}

// Generic fetch wrapper with error handling
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const response = await fetch(url, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 Unauthorized - redirect to login
    if (response.status === 401) {
      // Clear auth storage
      localStorage.removeItem("auth-storage");
      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    throw new Error(data.error?.message || "An error occurred");
  }

  return data;
}

// Task API functions
export const taskApi = {
  // Get all tasks
  async getAll() {
    const response = await fetchApi("/tasks");
    return response.data;
  },

  // Get single task
  async getById(id) {
    const response = await fetchApi(`/tasks/${id}`);
    return response.data;
  },

  // Create task
  async create(taskData) {
    const response = await fetchApi("/tasks", {
      method: "POST",
      body: JSON.stringify(taskData),
    });
    return response.data;
  },

  // Update task
  async update(id, taskData) {
    const response = await fetchApi(`/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(taskData),
    });
    return response.data;
  },

  // Delete task
  async delete(id) {
    const response = await fetchApi(`/tasks/${id}`, {
      method: "DELETE",
    });
    return response.data;
  },

  // Start task (user starts working on their assigned pending task)
  async startTask(id) {
    const response = await fetchApi(`/tasks/${id}/start`, {
      method: "POST",
    });
    return response.data;
  },

  // Complete task (user marks their in-progress task as done, sends to review)
  async completeTask(id) {
    const response = await fetchApi(`/tasks/${id}/complete`, {
      method: "POST",
    });
    return response.data;
  },

  // Approve task (admin approves a task pending review)
  async approveTask(id) {
    const response = await fetchApi(`/tasks/${id}/approve`, {
      method: "POST",
    });
    return response.data;
  },

  // Reject task (admin rejects a task pending review, sends back to in_progress)
  async rejectTask(id) {
    const response = await fetchApi(`/tasks/${id}/reject`, {
      method: "POST",
    });
    return response.data;
  },
};
