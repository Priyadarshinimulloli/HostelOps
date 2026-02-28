import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
};

// Complaints API
export const complaintsAPI = {
  create: (data) => {
    // If data is FormData, let browser set Content-Type automatically (includes boundary)
    if (data instanceof FormData) {
      const token = localStorage.getItem('token');
      return axios.post(`${API_URL}/complaints`, data, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
    }
    // Otherwise send as JSON
    return api.post('/complaints', data);
  },
  getMy: () => api.get('/complaints/my'),
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return api.get(`/complaints${params ? `?${params}` : ''}`);
  },
  updateStatus: (id, status) => api.put(`/complaints/${id}`, { status }),
};

export default api;
