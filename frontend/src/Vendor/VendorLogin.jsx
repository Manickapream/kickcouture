import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import { FaHourglassHalf, FaTimesCircle, FaBan, FaStore } from 'react-icons/fa';
import './VendorLogin.css';

const VendorLogin = () => {
  const navigate = useNavigate();
  const { loginVendor, logoutUser, logoutAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusInfo, setStatusInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatusInfo(null);
    setLoading(true);
    try {
      const res = await vendorService.login({ email, password });
      logoutUser();
      logoutAdmin();
      loginVendor(res.data.token, res.data.vendor);
      navigate('/vendor-dashboard');
    } catch (err) {
      const data = err.response?.data;
      if (data?.status) {
        setStatusInfo(data);
      } else {
        setError(data?.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStatusMessage = () => {
    if (!statusInfo) return null;
    const statusConfig = {
      pending: {
        icon: <FaHourglassHalf />,
        title: 'Application Pending',
        msg: 'Your vendor application is under review. You will receive access once approved.',
        color: '#f59e0b',
      },
      rejected: {
        icon: <FaTimesCircle />,
        title: 'Application Rejected',
        msg: statusInfo.reason
          ? `Your application was rejected: "${statusInfo.reason}"`
          : 'Your vendor application was not approved. Contact support for assistance.',
        color: '#ef4444',
      },
      suspended: {
        icon: <FaBan />,
        title: 'Account Suspended',
        msg: 'Your vendor account has been suspended. Please contact platform support.',
        color: '#f97316',
      },
    };
    const cfg = statusConfig[statusInfo.status] || {};
    return (
      <div className="status-card" style={{ borderColor: cfg.color }}>
        <div className="status-icon" style={{ color: cfg.color }}>{cfg.icon}</div>
        <h3>{cfg.title}</h3>
        <p>{cfg.msg}</p>
      </div>
    );
  };

  return (
    <div className="vendor-login-container">
      <div className="vendor-login-card">

        {/* LEFT BRANDING PANEL */}
        <div className="login-left-panel">
          <div className="panel-logo">Kick<span>Couture</span></div>
          <div className="panel-tagline">Vendor Portal</div>
          <div className="panel-icon-wrap">
            <FaStore />
          </div>
          <div className="panel-title">Welcome Back, Seller!</div>
          <div className="panel-desc">
            Sign in to manage your products, track orders, and grow your business on KickCouture.
          </div>
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="login-right-panel">
          <div className="login-header">
            <h2>Vendor Sign In</h2>
            <p>Sign in to manage your store</p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}
          {renderStatusMessage()}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="vendorEmail">Email Address</label>
              <input
                id="vendorEmail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vendor@business.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vendorPassword">Password</label>
              <input
                id="vendorPassword"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In to Vendor Portal'}
            </button>
          </form>

          <div className="login-footer">
            <p>New vendor? <Link to="/vendor-register">Apply here →</Link></p>
            <p>Looking to shop? <Link to="/UserLogin">Customer Login →</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VendorLogin;
