import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT Bearer Token into headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('utsavlocal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global response / authorization errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: if token expired, we can clear token if 401 and not on login page
    if (error.response && error.response.status === 401) {
      // Don't auto-redirect on login attempt failure
      if (!error.config.url.includes('/auth/login')) {
        // localStorage.removeItem('utsavlocal_token');
      }
    }
    return Promise.reject(error);
  }
);

// Modular API services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const eventService = {
  getAll: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.put(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
};

export const userService = {
  toggleSave: (eventId) => api.post(`/users/save/${eventId}`),
  toggleRsvp: (eventId) => api.post(`/users/rsvp/${eventId}`),
  getDashboard: () => api.get('/users/dashboard'),
};

export const adminService = {
  getPendingEvents: () => api.get('/admin/events/pending'),
  updateStatus: (id, status) => api.patch(`/admin/events/${id}/status`, { status }),
  getStats: () => api.get('/admin/stats'),
};

export default api;
