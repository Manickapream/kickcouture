import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import axios from "axios";
import "./Payment.css";

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems = [], totalAmount = 0 } = location.state || {};

  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    paymentType: "",
    onlineMode: "",
    upiId: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

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

  // 🧾 Generate PDF Bill
  const handleGenerateBill = () => {
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Kick Couture", 20, 20);
    doc.setFontSize(14);
    doc.text("Purchase Invoice", 20, 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${form.name}`, 20, 50);
    doc.text(`Email: ${form.email}`, 20, 58);
    doc.text(`Address: ${form.address}`, 20, 66);
    doc.text(`Phone: ${form.phone}`, 20, 74);
    doc.text(`Payment Type: ${form.paymentType}`, 20, 82);
    if (form.paymentType === "Online") {
      doc.text(`Online Mode: ${form.onlineMode}`, 20, 90);
    }

    let y = 110;
    doc.setFont("helvetica", "bold");
    doc.text("No", 20, y);
    doc.text("Product Name", 35, y);
    doc.text("Price", 120, y);
    doc.text("Qty", 145, y);
    doc.text("Total", 165, y);

    doc.setFont("helvetica", "normal");
    y += 10;
    cartItems.forEach((item, index) => {
      const itemTotal = item.productId.price * item.quantity;
      doc.text(`${index + 1}`, 20, y);
      doc.text(`${item.productId.name}`, 35, y);
      doc.text(`₹${item.productId.price}`, 120, y);
      doc.text(`${item.quantity}`, 145, y);
      doc.text(`₹${itemTotal}`, 165, y);
      y += 10;
    });

    y += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total: ₹${totalAmount}`, 20, y);

    y += 20;
    doc.setFont("helvetica", "italic");
    doc.text("Thank you for shopping with Kick Couture!", 20, y);

    doc.save("KickCouture_Bill.pdf");
  };

  // ✅ Save Order to Database
  const saveOrderToDatabase = async () => {
    try {
      const email = form.email;
      for (const item of cartItems) {
        await axios.post("http://localhost:5000/api/order/add", {
          email,
          productId: item.productId._id,
          quantity: item.quantity,
          totalPrice: item.productId.price * item.quantity,
          status: "paid",
        });
      }
    } catch (err) {
      console.error("Error saving order:", err);
      alert("Something went wrong while saving order.");
    }
  };

  // ✅ Clear Cart after successful purchase
  const clearCartAfterPurchase = async () => {
    try {
      const email = form.email;
      const res = await axios.get("http://localhost:5000/api/order/all");
      const cartOrders = res.data.orders.filter(
        (order) => order.email === email && order.status === "cart"
      );

      for (const order of cartOrders) {
        await axios.delete(`http://localhost:5000/api/order/${order._id}`);
      }

      console.log("Cart cleared after purchase.");
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  // ✅ Submit Payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validatePayment();
    if (error) {
      alert(error);
      return;
    }

    if (form.paymentType === "Offline") {
      await saveOrderToDatabase();
      await clearCartAfterPurchase(); // 🧹 clear cart
      handleGenerateBill();
      alert("Purchase successful (Offline).");
      navigate("/UserProfile");
    } else {
      alert(`Processing ${form.onlineMode} payment...`);
      setTimeout(async () => {
        alert("Payment successful!");
        await saveOrderToDatabase();
        await clearCartAfterPurchase(); // 🧹 clear cart
        handleGenerateBill();
        navigate("/UserProfile");
      }, 1500);
    }
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.productId.price * item.quantity,
    0
  );

  return (
    <div className="payment-container">
      <h2>Kick Couture - Checkout</h2>

      <div className="payment-box">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name:</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Email:</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Address:</label>
            <textarea
              name="address"
              rows="3"
              required
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="input-group">
            <label>Phone Number:</label>
            <input
              type="tel"
              name="phone"
              pattern="[0-9]{10}"
              required
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Payment Type:</label>
            <select name="paymentType" onChange={handleChange} required>
              <option value="">Select</option>
              <option value="Offline">Offline Payment</option>
              <option value="Online">Online Payment</option>
            </select>
          </div>

          {form.paymentType === "Online" && (
            <>
              <div className="input-group">
                <label>Online Payment Mode:</label>
                <select name="onlineMode" onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit/Debit Card">Credit/Debit Card</option>
                </select>
              </div>

              {form.onlineMode === "UPI" && (
                <div className="input-group">
                  <label>UPI ID:</label>
                  <input
                    type="text"
                    name="upiId"
                    placeholder="example@upi"
                    required
                    onChange={handleChange}
                  />
                </div>
              )}

              {form.onlineMode === "Credit/Debit Card" && (
                <>
                  <div className="input-group">
                    <label>Card Number:</label>
                    <input
                      type="text"
                      name="cardNumber"
                      maxLength="16"
                      placeholder="1234123412341234"
                      required
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field-row">
                    <div className="input-group half">
                      <label>Expiry (MM/YY):</label>
                      <input
                        type="text"
                        name="expiry"
                        placeholder="09/28"
                        required
                        onChange={handleChange}
                      />
                    </div>
                    <div className="input-group half">
                      <label>CVV:</label>
                      <input
                        type="password"
                        name="cvv"
                        maxLength="3"
                        placeholder="123"
                        required
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div className="total-amount">
            <h3>Total: ₹{total}</h3>
          </div>

          <div className="payment-actions">
            <button type="submit">Confirm & Pay</button>
            <button type="button" onClick={() => navigate(-1)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
