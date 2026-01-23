const API_BASE_URL = "/api/v1";

// Generic fetch wrapper with error handling
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  const data = await response.json();

  if (!response.ok) {
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
};
