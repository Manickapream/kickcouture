import api from '../api/axiosConfig';

export const authService = {
  getAdminToken: () => localStorage.getItem('adminToken'),
  getUserToken:  () => localStorage.getItem('userToken'),
  getVendorToken: () => localStorage.getItem('vendorToken'),

  getAuthHeader: (role = 'user') => {
    const key = role === 'admin' ? 'adminToken' : role === 'vendor' ? 'vendorToken' : 'userToken';
    const token = localStorage.getItem(key);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

export default authService;
