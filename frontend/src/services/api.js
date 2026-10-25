const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Universal fetch wrapper that includes credentials for HTTP-only cookies
 * and standardizes JSON error handling.
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Crucial for HTTP-only cookies
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Authentication APIs
export const authAPI = {
  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getMe: () =>
    request('/auth/me', {
      method: 'GET',
    }),
};

// User Profile & Teammates APIs
export const userAPI = {
  getProfile: () =>
    request('/users/profile', {
      method: 'GET',
    }),

  updateProfile: (profileData) =>
    request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  getTeammates: () =>
    request('/users/teammates', {
      method: 'GET',
    }),
};

// Projects APIs
export const projectAPI = {
  getAll: () =>
    request('/projects', {
      method: 'GET',
    }),

  getById: (id) =>
    request(`/projects/${id}`, {
      method: 'GET',
    }),

  create: (projectData) =>
    request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    }),

  update: (id, projectData) =>
    request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    }),

  delete: (id) =>
    request(`/projects/${id}`, {
      method: 'DELETE',
    }),

  getMyProjects: () =>
    request('/projects/my-projects', {
      method: 'GET',
    }),

  requestJoin: (id) =>
    request(`/projects/${id}/join`, {
      method: 'POST',
    }),

  getRequests: (id) =>
    request(`/projects/${id}/requests`, {
      method: 'GET',
    }),

  handleRequest: (id, requestId, status) =>
    request(`/projects/${id}/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
