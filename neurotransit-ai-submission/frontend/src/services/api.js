import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API calls
export const intersectionsAPI = {
  getAll: () => api.get('/intersections'),
  getById: (id) => api.get(`/intersections/${id}`),
  getSignal: (id) => api.get(`/intersections/${id}/signal`),
  getHistory: (id) => api.get(`/intersections/${id}/history`),
  updateTraffic: (id, vehicleCount) => 
    api.post(`/intersections/${id}/traffic`, { vehicleCount })
};

export const emergencyAPI = {
  register: (vehicleType, location, destination) =>
    api.post('/emergency/register', { vehicleType, location, destination }),
  prioritize: (id, corridorIntersections) =>
    api.post(`/emergency/${id}/prioritize`, { corridorIntersections }),
  getById: (id) => api.get(`/emergency/${id}`),
  clear: (id) => api.post(`/emergency/${id}/clear`),
  getActive: () => api.get('/emergency')
};

export const analyticsAPI = {
  getMetrics: () => api.get('/analytics/metrics'),
  getTraffic: () => api.get('/analytics/traffic'),
  getEfficiency: () => api.get('/analytics/efficiency'),
  getHistory: (limit = 100) => api.get(`/analytics/history?limit=${limit}`),
  getTrends: () => api.get('/analytics/trends')
};

export const healthAPI = {
  check: () => api.get('/health'),
  getIntersectionsStatus: () => api.get('/health/intersections'),
  getSystemStatus: () => api.get('/health/status')
};

export default api;
