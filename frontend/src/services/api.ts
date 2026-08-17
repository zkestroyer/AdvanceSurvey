import axios from 'axios';

const api = axios.create({
  // Use the global API_URL injected in index.html, fallback to local dev
  baseURL: (window as any).API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
