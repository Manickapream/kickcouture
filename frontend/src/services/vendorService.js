import api from '../api/axiosConfig';
import authService from './authService';

const vendorHeaders = () => authService.getAuthHeader('vendor');

const vendorService = {
  register: (data) => api.post('/api/vendor/register', data),
  login: (data) => api.post('/api/vendor/login', data),

  getProfile: () => api.get('/api/vendor/profile', { headers: vendorHeaders() }),
  updateProfile: (data) => api.put('/api/vendor/profile', data, { headers: vendorHeaders() }),
  getDashboard: () => api.get('/api/vendor/dashboard', { headers: vendorHeaders() }),

  getProducts: () => api.get('/api/vendor/products', { headers: vendorHeaders() }),
  addProduct: (formData) =>
    api.post('/api/vendor/products', formData, {
      headers: { ...vendorHeaders(), 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id, formData) =>
    api.put(`/api/vendor/products/${id}`, formData, {
      headers: { ...vendorHeaders(), 'Content-Type': 'multipart/form-data' },
    }),
  deleteProduct: (id) =>
    api.delete(`/api/vendor/products/${id}`, { headers: vendorHeaders() }),

  getOrders: () => api.get('/api/vendor/orders', { headers: vendorHeaders() }),
  cancelOrder: (id, reason) => api.put(`/api/vendor/orders/${id}/cancel`, { reason }, { headers: vendorHeaders() }),
};

export default vendorService;
