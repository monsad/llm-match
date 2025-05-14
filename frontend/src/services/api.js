import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid
      localStorage.removeItem('token');
    }
    
    return Promise.reject(error);
  }
);

export default api;

// API service functions
export const authService = {
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return api.post('/api/v1/auth/login', formData);
  },
  register: (userData) => api.post('/api/v1/auth/register', userData),
  getCurrentUser: () => api.get('/api/v1/users/me'),
  updatePassword: (currentPassword, newPassword) => 
    api.put('/api/v1/users/me/password', { current_password: currentPassword, new_password: newPassword }),
};

export const modelService = {
  getModels: (params) => api.get('/api/v1/models', { params }),
  getModel: (id) => api.get(`/api/v1/models/${id}`),
  createModel: (modelData) => api.post('/api/v1/models', modelData),
  updateModel: (id, modelData) => api.put(`/api/v1/models/${id}`, modelData),
  deleteModel: (id) => api.delete(`/api/v1/models/${id}`),
  saveModel: (modelId, notes) => api.post('/api/v1/models/save', { model_id: modelId, notes }),
  unsaveModel: (modelId) => api.delete(`/api/v1/models/save/${modelId}`),
};

export const recommendationService = {
  getQuestions: () => api.get('/api/v1/recommendations/questions'),
  createRecommendation: (requirements) => api.post('/api/v1/recommendations', { requirements }),
  getRecommendations: () => api.get('/api/v1/recommendations'),
  getRecommendation: (id) => api.get(`/api/v1/recommendations/${id}`),
  deleteRecommendation: (id) => api.delete(`/api/v1/recommendations/${id}`),
};

export const adminService = {
  getUsers: (params) => api.get('/api/v1/users', { params }),
  getUser: (id) => api.get(`/api/v1/users/${id}`),
  activateUser: (id) => api.put(`/api/v1/users/${id}/activate`),
  deactivateUser: (id) => api.put(`/api/v1/users/${id}/deactivate`),
};
