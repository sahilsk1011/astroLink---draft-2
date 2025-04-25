import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

// Client API calls
export const clientAPI = {
  getDashboard: () => api.get('/client/dashboard'),
  submitRequest: (requestData) => api.post('/client/request', requestData),
  getRequests: () => api.get('/client/requests'),
};

// Astrologer API calls

export const astrologerAPI = {
    getDashboard: () => api.get('/astrologer/dashboard'),
    getAvailableRequests: () => api.get('/astrologer/requests'),
    acceptRequest: (requestId) => api.post(`/astrologer/accept/${requestId}`),
    getActiveRequests: () => api.get('/astrologer/active-requests'),
    getRequestDetails: (requestId) => api.get(`/request/${requestId}`),
  };

export default api;