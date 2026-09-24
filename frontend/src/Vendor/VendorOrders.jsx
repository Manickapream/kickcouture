import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import VendorMobileNav from './VendorMobileNav';
import './VendorOrders.css';

const statusColors = {
  pending: '#f59e0b', paid: '#3b82f6', approved: '#22c55e',
  shipped: '#8b5cf6', delivered: '#10b981', canceled: '#ef4444',
  refund: '#f97316',
};

const VendorOrders = () => {
  const { logoutVendor } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = () => {
    setLoading(true);
    vendorService.getOrders()
      .then(res => setOrders(res.data.orders || []))
      .catch(err => console.error('Failed to fetch orders:', err))
      .finally(() => setLoading(false));
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt("Please enter a reason for cancellation:");
    if (!reason || reason.trim() === "") return;
    
    try {
      await vendorService.cancelOrder(orderId, reason);
      alert("Order canceled successfully");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  const canCancel = (order) => {
    if (order.status === "canceled") return false;
    const diffHours = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  return (
    <div className="vo-container">
      <div className="vo-sidebar">
        <div className="sidebar-brand"><h2><span className="accent">Kick</span>Couture</h2><p>Vendor Portal</p></div>
        <nav className="sidebar-nav">
          <Link to="/vendor-dashboard" className="nav-item">🏠 Dashboard</Link>
          <Link to="/vendor-products" className="nav-item">👟 My Products</Link>
          <Link to="/vendor-orders" className="nav-item active">📦 My Orders</Link>
          <Link to="/vendor-profile" className="nav-item">👤 Profile</Link>
        </nav>
        <button className="logout-btn" onClick={() => { logoutVendor(); navigate('/vendor-login'); }}>← Logout</button>
      </div>

      <div className="vo-main">
        <div className="vo-header">
          <h1>My Orders</h1>
          <p className="vo-subtitle">Orders placed for your products</p>
        </div>

        {loading ? (
          <div className="loading-state">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Orders for your products will appear here.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map(order => (
              <div className="order-card" key={order._id}>
                <div className="order-header">
                  <div>
                    <div className="order-id">Order ID: {order._id.slice(-8)}</div>
                    <div className="order-date">{formatDate(order.createdAt)}</div>
                  </div>
                  <span className="order-status" style={{ backgroundColor: statusColors[order.status] || '#9ca3af' }}>
                    {order.status}
                  </span>
                </div>
                
                <div className="order-product">
                  {order.product?.image && (
                    <img className="order-img" src={`${API_BASE}/${order.product.image}`} alt={order.product?.name} />
                  )}
                  <div className="order-details">
                    <h3>{order.product?.name || 'Unknown Product'}</h3>
                    <p>Qty: {order.quantity || 1}</p>
                    <div className="order-price">₹{order.totalPrice || 0}</div>
                  </div>
                </div>

                <div className="customer-info">
                  <h4>Customer</h4>
                  <p>{order.customerEmail}</p>
                  
                  {order.status === 'canceled' && order.cancelReason && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#fee2e2', borderRadius: '6px', fontSize: '0.85rem' }}>
                      <strong style={{ color: '#dc2626' }}>Reason:</strong> {order.cancelReason}
                    </div>
                  )}

                  {canCancel(order) && (
                    <button 
                      onClick={() => handleCancelOrder(order._id)}
                      style={{ marginTop: '12px', padding: '8px 12px', background: '#fff', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '600' }}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <VendorMobileNav />
    </div>
  );
};

export default VendorOrders;
