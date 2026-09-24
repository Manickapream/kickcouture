import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';

export const Cart = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const token = localStorage.getItem("userToken");
      const res = await api.get(`/api/order/cart/${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleUpdateQuantity = async (order, newQty) => {
    if (newQty < 1) return;

    const product = order.productId;
    // Frontend stock check
    if (product?.count > 0 && newQty > product.count) {
      alert(`Only ${product.count} item(s) available in stock!`);
      return;
    }

    setUpdatingId(order._id);
    try {
      const token = localStorage.getItem("userToken");
      await api.patch(`/api/order/${order._id}/quantity`, { quantity: newQty }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state without re-fetch
      setProducts(prev =>
        prev.map(o =>
          o._id === order._id ? { ...o, quantity: newQty } : o
        )
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Error updating quantity";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveFromCart = async (product) => {
    try {
      const token = localStorage.getItem("userToken");
      await api.delete(`/api/order/${product._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  const totalPrice = () => {
    return products.reduce((total, order) => {
      const price = order.productId?.price || 0;
      const qty = order.quantity || 1;
      return total + price * qty;
    }, 0);
  };

  const handleBuyAll = () => {
    navigate("/payment", {
      state: {
        cartItems: products,
        totalAmount: totalPrice(),
      },
    });
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="cart-container">
          <h2 className="cart-title">Your Cart</h2>

          <div className="cart-summary">
            <div className="cart-total">
              Total: ₹ {totalPrice()}
            </div>

            {products.length > 0 && (
              <button onClick={handleBuyAll} className="buy-all-btn">
                Buy All <FaMoneyBillWave />
              </button>
            )}
          </div>

          {products.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty.</p>
              <button onClick={() => navigate('/collection')} className="buy-all-btn" style={{ margin: '20px auto' }}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <section className="cart-items">
              {products.map((order) => {
                const product = order.productId;
                if (!product) return null;
                const qty = order.quantity || 1;
                const maxStock = product.count > 0 ? product.count : Infinity;
                const isUpdating = updatingId === order._id;

                return (
                  <div className="cart-item" key={order._id}>
                    <div className="cart-item-image">
                      <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/${product.image}`} alt={product.name} />
                    </div>
                    <div className="cart-item-details">
                      <h1>{product.name}</h1>
                      <h2>Size {product.size}</h2>
                      <h3>₹ {product.price * qty}</h3>
                      <p>{product.brand} - {product.description}</p>

                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Qty:</span>
                        <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                          <button
                            onClick={() => handleUpdateQuantity(order, qty - 1)}
                            disabled={qty <= 1 || isUpdating}
                            style={{
                              width: '32px', height: '32px', border: 'none',
                              background: qty <= 1 ? '#f3f4f6' : '#f9fafb',
                              cursor: qty <= 1 ? 'not-allowed' : 'pointer',
                              fontSize: '1rem', fontWeight: '700',
                              color: qty <= 1 ? '#d1d5db' : '#374151',
                              transition: 'background 0.2s'
                            }}
                          >−</button>
                          <span style={{
                            minWidth: '36px', textAlign: 'center',
                            fontSize: '0.95rem', fontWeight: '700',
                            color: '#111827', padding: '0 4px',
                            opacity: isUpdating ? 0.5 : 1
                          }}>
                            {isUpdating ? '...' : qty}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(order, qty + 1)}
                            disabled={qty >= maxStock || isUpdating}
                            style={{
                              width: '32px', height: '32px', border: 'none',
                              background: qty >= maxStock ? '#f3f4f6' : '#f9fafb',
                              cursor: qty >= maxStock ? 'not-allowed' : 'pointer',
                              fontSize: '1rem', fontWeight: '700',
                              color: qty >= maxStock ? '#d1d5db' : '#374151',
                              transition: 'background 0.2s'
                            }}
                          >+</button>
                        </div>
                        {product.count > 0 && (
                          <span style={{
                            fontSize: '0.75rem',
                            color: qty >= maxStock ? '#e52e71' : '#6b7280'
                          }}>
                            {qty >= maxStock ? `⚠️ Max (${product.count})` : `${product.count} in stock`}
                          </span>
                        )}
                      </div>

                      <div className="cart-item-actions">
                        <button className="remove-btn" onClick={() => handleRemoveFromCart(order)}>
                          Remove <FaShoppingCart />
                        </button>
                        <button
                          className="pay-now-btn"
                          onClick={() => navigate("/payment", { state: { product: product, quantity: qty, cartOrderId: order._id } })}
                        >
                          Pay Now <FaMoneyBillWave />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
