import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { useAuth } from "../context/AuthContext";
import "./Payment.css";

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const rawCartItems = location.state?.cartItems || [];
  const singleProduct = location.state?.product;
  const singleQuantity = location.state?.quantity || 1;

  const cartItems = singleProduct
    ? [{ productId: singleProduct, quantity: singleQuantity }]
    : rawCartItems;

  const calculatedTotalAmount =
    location.state?.totalAmount ||
    cartItems.reduce(
      (acc, item) => acc + (item.productId?.price || 0) * (item.quantity || 1),
      0
    );

  // Pre-fill from logged-in user data
  const [form, setForm] = useState({
    name: userData?.name || "",
    email: userData?.email || localStorage.getItem("userEmail") || "",
    address: "",
    phone: "",
    paymentType: "",
    onlineMode: "",
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Update form if userData loads after initial render
  useEffect(() => {
    if (userData) {
      setForm((prev) => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validatePayment = () => {
    if (!form.name || !form.email || !form.address || !form.phone)
      return "Please fill all personal details.";
    if (!form.paymentType) return "Please select a payment type.";
    if (form.paymentType === "Online") {
      if (!form.onlineMode) return "Please select an online payment mode.";
      if (form.onlineMode === "UPI" && !/^\w+@\w+$/.test(form.upiId))
        return "Invalid UPI ID (e.g., name@upi).";
      if (form.onlineMode === "Credit/Debit Card") {
        if (!/^\d{16}$/.test(form.cardNumber))
          return "Card number must be 16 digits.";
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(form.expiry))
          return "Expiry must be in MM/YY format.";
        if (!/^\d{3}$/.test(form.cvv)) return "CVV must be 3 digits.";
      }
    }
    return null;
  };


  const saveOrderToDatabase = async () => {
    try {
      const token = localStorage.getItem("userToken");
      for (const item of cartItems) {
        await api.post(
          "/api/order/add",
          {
            email: form.email,
            productId: item.productId._id,
            quantity: item.quantity || 1,
            totalPrice: (item.productId?.price || 0) * (item.quantity || 1),
            status: "paid",
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (err) {
      console.error("Error saving order:", err);
      alert("Something went wrong while saving order.");
    }
  };

  const clearCartAfterPurchase = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const email = form.email;
      const isCartCheckout = !!location.state?.cartItems;
      const singleCartOrderId = location.state?.cartOrderId;
      if (isCartCheckout) {
        const res = await api.get(`/api/order/cart/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cartOrders = res.data.orders || [];
        for (const order of cartOrders) {
          await api.delete(`/api/order/${order._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      } else if (singleCartOrderId) {
        await api.delete(`/api/order/${singleCartOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validatePayment();
    if (error) {
      alert(error);
      return;
    }
    setProcessing(true);
    setTimeout(async () => {
      setProcessing(false);
      setSuccess(true);
      await saveOrderToDatabase();
      await clearCartAfterPurchase();
      setTimeout(() => {
        navigate("/old-orders");
      }, 2000);
    }, 2000);
  };

  const total = calculatedTotalAmount;

  return (
    <div className="payment-page">
      {/* Processing Modal */}
      {processing && (
        <div className="pay-overlay">
          <div className="pay-modal">
            <div className="pay-spinner"></div>
            <h2>Processing Payment...</h2>
            <p>Please do not close this window</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="pay-overlay">
          <div className="pay-modal pay-modal--success">
            <div className="pay-success-icon">✅</div>
            <h2>Payment Successful!</h2>
            <p>Redirecting to your profile...</p>
          </div>
        </div>
      )}

      <div className="pay-container">
        {/* Left: Order Summary */}
        <div className="pay-summary">
          <h2 className="pay-section-title">Order Summary</h2>
          <div className="pay-items">
            {cartItems.map((item, i) => (
              <div className="pay-item" key={i}>
                <div className="pay-item-img">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"}/${item.productId?.image}`}
                    alt={item.productId?.name}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="pay-item-info">
                  <p className="pay-item-brand">{item.productId?.brand}</p>
                  <h4 className="pay-item-name">{item.productId?.name}</h4>
                  <p className="pay-item-qty">Qty: {item.quantity || 1}</p>
                </div>
                <div className="pay-item-price">
                  ₹{(item.productId?.price || 0) * (item.quantity || 1)}
                </div>
              </div>
            ))}
          </div>

          <div className="pay-total-row">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="pay-total-row">
            <span>Shipping</span>
            <span className="pay-free">FREE</span>
          </div>
          <div className="pay-total-row pay-grand-total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
        </div>

        {/* Right: Checkout Form */}
        <div className="pay-form-section">
          <h2 className="pay-section-title">Checkout Details</h2>

          {/* Auto-filled user info badge */}
          {userData && (
            <div className="pay-autofill-badge">
              <span className="pay-autofill-icon">✓</span>
              Logged in as <strong>{userData.name}</strong> — details pre-filled
            </div>
          )}

          <form onSubmit={handleSubmit} className="pay-form">
            {/* Personal Details */}
            <div className="pay-field-group">
              <h3 className="pay-field-group-title">Personal Details</h3>

              <div className="pay-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="pay-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="pay-input-disabled"
                />
              </div>

              <div className="pay-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div className="pay-field">
                <label>Delivery Address</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Door No, Street, City, State, PIN"
                  required
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="pay-field-group">
              <h3 className="pay-field-group-title">Payment Method</h3>

              <div className="pay-method-tabs">
                <button
                  type="button"
                  className={`pay-method-tab ${form.paymentType === "Online" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, paymentType: "Online", onlineMode: "" })}
                >
                  💳 Online
                </button>
                <button
                  type="button"
                  className={`pay-method-tab ${form.paymentType === "Offline" ? "active" : ""}`}
                  onClick={() => setForm({ ...form, paymentType: "Offline", onlineMode: "" })}
                >
                  💵 Cash on Delivery
                </button>
              </div>

              {form.paymentType === "Online" && (
                <div className="pay-online-modes">
                  <div className="pay-mode-cards">
                    <div
                      className={`pay-mode-card ${form.onlineMode === "UPI" ? "active" : ""}`}
                      onClick={() => setForm({ ...form, onlineMode: "UPI" })}
                    >
                      <span className="pay-mode-icon">📱</span>
                      <span>UPI</span>
                    </div>
                    <div
                      className={`pay-mode-card ${form.onlineMode === "Credit/Debit Card" ? "active" : ""}`}
                      onClick={() => setForm({ ...form, onlineMode: "Credit/Debit Card" })}
                    >
                      <span className="pay-mode-icon">💳</span>
                      <span>Card</span>
                    </div>
                  </div>

                  {form.onlineMode === "UPI" && (
                    <div className="pay-field">
                      <label>UPI ID</label>
                      <input
                        type="text"
                        name="upiId"
                        value={form.upiId}
                        onChange={handleChange}
                        placeholder="yourname@upi"
                        required
                      />
                    </div>
                  )}

                  {form.onlineMode === "Credit/Debit Card" && (
                    <div className="pay-card-fields">
                      <div className="pay-field">
                        <label>Card Number</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={form.cardNumber}
                          onChange={handleChange}
                          maxLength="16"
                          placeholder="1234 5678 9012 3456"
                          required
                        />
                      </div>
                      <div className="pay-field-row">
                        <div className="pay-field">
                          <label>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            name="expiry"
                            value={form.expiry}
                            onChange={handleChange}
                            placeholder="09/28"
                            required
                          />
                        </div>
                        <div className="pay-field">
                          <label>CVV</label>
                          <input
                            type="password"
                            name="cvv"
                            value={form.cvv}
                            onChange={handleChange}
                            maxLength="3"
                            placeholder="•••"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {form.paymentType === "Offline" && (
                <div className="pay-cod-info">
                  <span>📦</span>
                  <p>Pay when your order arrives at your doorstep. No advance payment required.</p>
                </div>
              )}
            </div>

            <div className="pay-submit-area">
              <div className="pay-amount-preview">
                <span>Amount to Pay</span>
                <strong>₹{total}</strong>
              </div>
              <button type="submit" className="pay-submit-btn">
                Confirm &amp; Pay ₹{total}
              </button>
              <button type="button" className="pay-cancel-btn" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
