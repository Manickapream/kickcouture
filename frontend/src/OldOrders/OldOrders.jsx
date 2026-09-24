import React, { useState, useEffect } from 'react';
import './OldOrders.css';
import { useNavigate } from 'react-router-dom';
import api from "../api/axiosConfig";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const STATUS_CONFIG = {
  paid:      { label: "Paid",      color: "#16a34a", bg: "#dcfce7", icon: "💳" },
  approved:  { label: "Approved",  color: "#2563eb", bg: "#dbeafe", icon: "✅" },
  shipped:   { label: "Shipped",   color: "#7c3aed", bg: "#ede9fe", icon: "🚚" },
  delivered: { label: "Delivered", color: "#059669", bg: "#d1fae5", icon: "📦" },
  pending:   { label: "Pending",   color: "#d97706", bg: "#fef3c7", icon: "⏳" },
  canceled:  { label: "Cancelled", color: "#dc2626", bg: "#fee2e2", icon: "❌" },
  refund:    { label: "Refund",    color: "#6b7280", bg: "#f3f4f6", icon: "↩️" },
};

export const OldOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("userToken");
      const res = await api.get(`/api/order?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Show all orders except cart items
      const filtered = (res.data.orders || []).filter(o => o.status !== "cart");
      setOrders(filtered);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId, status) => {
    if (status === "approved" || status === "shipped" || status === "delivered") {
      alert("This order cannot be cancelled anymore.");
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      const token = localStorage.getItem("userToken");
      await api.delete(`/api/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order", err);
      alert("Failed to cancel. Please try again.");
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="oo-loading">
        <div className="oo-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="oo-page">
      <div className="oo-header">
        <h1 className="oo-title">My Orders</h1>
        <p className="oo-subtitle">{orders.length} order{orders.length !== 1 ? "s" : ""} placed</p>
      </div>

      {orders.length === 0 ? (
        <div className="oo-empty">
          <div className="oo-empty-icon">🛍️</div>
          <h2>No orders yet!</h2>
          <p>Looks like you haven't ordered anything yet. Start shopping!</p>
          <button onClick={() => navigate("/collection")} className="oo-shop-btn">
            Explore Collection
          </button>
        </div>
      ) : (
        <div className="oo-list">
          {orders.map((order) => {
            const product = order.productId;
            if (!product) return null;
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const canCancel = !["approved", "shipped", "delivered"].includes(order.status);

            return (
              <div className="oo-card" key={order._id}>
                {/* Product image */}
                <div className="oo-card-img">
                  <img
                    src={`${API_BASE}/${product.image}`}
                    alt={product.name}
                    onError={(e) => { e.target.src = ""; }}
                  />
                </div>

                {/* Product details */}
                <div className="oo-card-body">
                  <div className="oo-card-top">
                    <div>
                      <p className="oo-brand">{product.brand}</p>
                      <h3 className="oo-name">{product.name}</h3>
                      <p className="oo-meta">Size: {product.size} &nbsp;|&nbsp; Qty: {order.quantity || 1}</p>
                    </div>
                    <div
                      className="oo-status-badge"
                      style={{ color: statusInfo.color, background: statusInfo.bg }}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </div>
                  </div>

                  <div className="oo-card-bottom">
                    <div className="oo-price-info">
                      <span className="oo-price">₹{product.price * (order.quantity || 1)}</span>
                      <span className="oo-date">Ordered on {formatDate(order.createdAt)}</span>
                      {order.status === 'canceled' && order.cancelReason && (
                        <span className="oo-cancel-reason" style={{ display: 'block', color: '#dc2626', fontSize: '0.85rem', marginTop: '6px' }}>
                          <strong>Reason:</strong> {order.cancelReason}
                        </span>
                      )}
                    </div>
                    <div className="oo-actions">
                      <button
                        className="oo-view-btn"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        View Product
                      </button>
                      {canCancel && (
                        <button
                          className="oo-cancel-btn"
                          onClick={() => handleCancel(order._id, order.status)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
