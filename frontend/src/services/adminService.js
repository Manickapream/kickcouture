import api from '../api/axiosConfig';
import authService from './authService';

const adminHeaders = () => authService.getAuthHeader('admin');

const adminService = {
  login: (data) => api.post('/api/admin/login', data),

  // Vendor management
  getVendors: (status) =>
    api.get('/api/admin/vendors', {
      headers: adminHeaders(),
      params: status ? { status } : {},
    }),
  getVendorById: (id) =>
    api.get(`/api/admin/vendors/${id}`, { headers: adminHeaders() }),
  approveVendor: (id) =>
    api.patch(`/api/admin/vendors/${id}/approve`, {}, { headers: adminHeaders() }),
  rejectVendor: (id, reason) =>
    api.patch(`/api/admin/vendors/${id}/reject`, { reason }, { headers: adminHeaders() }),
  suspendVendor: (id) =>
    api.patch(`/api/admin/vendors/${id}/suspend`, {}, { headers: adminHeaders() }),
  reactivateVendor: (id) =>
    api.patch(`/api/admin/vendors/${id}/reactivate`, {}, { headers: adminHeaders() }),

  // User management
  getUsers: () => api.get('/api/user', { headers: adminHeaders() }),
  getUserCount: () => api.get('/api/user/userCount', { headers: adminHeaders() }),
  deleteUser: (id) => api.delete(`/api/user/${id}`, { headers: adminHeaders() }),
  blockUser: (id) => api.patch(`/api/user/${id}/block`, {}, { headers: adminHeaders() }),
  unblockUser: (id) => api.patch(`/api/user/${id}/unblock`, {}, { headers: adminHeaders() }),

  // Product management
  getProducts: () => api.get('/api/admin/products', { headers: adminHeaders() }),
  addProduct: (formData) =>
    api.post('/api/product/add', formData, {
      headers: { ...adminHeaders(), 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id, formData) =>
    api.put(`/api/product/${id}`, formData, {
      headers: { ...adminHeaders(), 'Content-Type': 'multipart/form-data' },
    }),
  deleteProduct: (id) =>
    api.delete(`/api/product/${id}`, { headers: adminHeaders() }),

  // Order management
  getOrders: () => api.get('/api/order/all', { headers: adminHeaders() }),
  approveOrder: (id) => api.put(`/api/order/${id}/approve`, {}, { headers: adminHeaders() }),
  deleteOrder: (id) => api.delete(`/api/order/${id}`, { headers: adminHeaders() }),

  // Reports
  getReports: () => api.get('/api/admin/reports', { headers: adminHeaders() }),
};

export default adminService;
