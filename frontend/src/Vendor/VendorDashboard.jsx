import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import VendorMobileNav from './VendorMobileNav';
import './VendorDashboard.css';

const VendorDashboard = () => {
  const { vendorData, logoutVendor } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ productCount: 0, orderCount: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.getDashboard()
      .then(res => setStats(res.data))
      .catch(err => console.error('Dashboard error:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logoutVendor();
    navigate('/vendor-login');
  };

  return (
    <div className="vendor-dash-container">
      <div className="vendor-dash-sidebar">
        <div className="sidebar-brand">
          <h2><span className="accent">Kick</span>Couture</h2>
          <p className="sidebar-role">Vendor Portal</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/vendor-dashboard" className="nav-item active">🏠 Dashboard</Link>
          <Link to="/vendor-products" className="nav-item">👟 My Products</Link>
          <Link to="/vendor-orders" className="nav-item">📦 My Orders</Link>
          <Link to="/vendor-profile" className="nav-item">👤 Profile</Link>
        </nav>
        <button className="logout-btn" onClick={handleLogout}>← Logout</button>
      </div>

      <div className="vendor-dash-main">
        <div className="dash-header">
          <div>
            <h1>Welcome back, {vendorData?.businessName || 'Vendor'}!</h1>
            <p className="dash-subtitle">Here's a snapshot of your store performance.</p>
          </div>
          <div className="status-badge approved">✅ Approved Vendor</div>
        </div>

        {loading ? (
          <div className="loading-state">Loading dashboard...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card purple">
                <div className="stat-icon">👟</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.productCount}</span>
                  <span className="stat-label">Active Products</span>
                </div>
              </div>
              <div className="stat-card blue">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <span className="stat-value">{stats.orderCount}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
              </div>
              <div className="stat-card green">
                <div className="stat-icon">💰</div>
                <div className="stat-info">
                  <span className="stat-value">₹{(stats.totalRevenue || 0).toLocaleString()}</span>
                  <span className="stat-label">Total Revenue</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-grid">
                <Link to="/vendor-products" className="action-card">
                  <div className="action-icon">➕</div>
                  <h3>Add Product</h3>
                  <p>List a new shoe for sale</p>
                </Link>
                <Link to="/vendor-products" className="action-card">
                  <div className="action-icon">📝</div>
                  <h3>Manage Products</h3>
                  <p>Edit or remove your listings</p>
                </Link>
                <Link to="/vendor-orders" className="action-card">
                  <div className="action-icon">📊</div>
                  <h3>View Orders</h3>
                  <p>Track customer orders</p>
                </Link>
                <Link to="/vendor-profile" className="action-card">
                  <div className="action-icon">⚙️</div>
                  <h3>Profile Settings</h3>
                  <p>Manage your account</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
      <VendorMobileNav />
    </div>
  );
};

export default VendorDashboard;
