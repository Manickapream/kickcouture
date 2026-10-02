import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
});

api.interceptors.request.use(
  (config) => {
    // Determine which token to use based on the request URL or what's available
    let token = null;
    
    if (config.url && config.url.includes('/api/admin')) {
      token = localStorage.getItem('adminToken');
    } else if (config.url && config.url.includes('/api/vendor')) {
      token = localStorage.getItem('vendorToken');
    } else {
      // Fallback to whatever token is available (user > vendor > admin)
      token = localStorage.getItem('userToken') || localStorage.getItem('adminToken') || localStorage.getItem('vendorToken');
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
