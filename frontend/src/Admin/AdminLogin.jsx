import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';

const AdminLogin = ({ onAdminLogin }) => {
  const navigate = useNavigate();
  const { loginAdmin, logoutUser, logoutVendor } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await adminService.login({ email, password });
      // Store token in context (and localStorage via context)
      logoutUser();
      logoutVendor();
      loginAdmin(res.data.token, res.data.admin);
      if (onAdminLogin) onAdminLogin(); // backward compat
      navigate('/Dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="admin-login-container">
          <form className="admin-login-form" onSubmit={handleSubmit}>
            <h2>Admin Login</h2>

            {error && <div className="login-error">⚠️ {error}</div>}

            <div className="form-group">
              <label htmlFor="adminEmail">Email:</label>
              <input
                type="email"
                id="adminEmail"
                placeholder="Admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="adminPassword">Password:</label>
              <input
                type="password"
                id="adminPassword"
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
