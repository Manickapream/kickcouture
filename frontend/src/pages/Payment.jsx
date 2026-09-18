import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import api from "../api/axiosConfig";
import "./Payment.css";

export const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const rawCartItems = location.state?.cartItems || [];
  const singleProduct = location.state?.product;
  const singleQuantity = location.state?.quantity || 1;

  const cartItems = singleProduct
    ? [{ productId: singleProduct, quantity: singleQuantity }]
    : rawCartItems;

  const calculatedTotalAmount = location.state?.totalAmount ||
    cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);

  const [form, setForm] = useState({
    name: "",
    email: localStorage.getItem("userEmail") || "",
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
    doc.text(`Grand Total: ₹${calculatedTotalAmount}`, 20, y);

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
        await api.post("/api/order/add", {
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

  // ✅ Clear Cart after successful purchase (conditionally)
  const clearCartAfterPurchase = async () => {
    try {
      const email = form.email;
      const isCartCheckout = !!location.state?.cartItems;
      const singleCartOrderId = location.state?.cartOrderId;

      if (isCartCheckout) {
        // Clearing full cart
        const res = await api.get(`/api/order/cart/${email}`);
        const cartOrders = res.data.orders;
        for (const order of cartOrders) {
          await api.delete(`/api/order/${order._id}`);
        }
        console.log("Full cart cleared after purchase.");
      } else if (singleCartOrderId) {
        // Clearing just the purchased cart item
        await api.delete(`/api/order/${singleCartOrderId}`);
        console.log(`Removed single item from cart after purchase.`);
      }
      // If neither, it's a direct Buy Now from catalog, so don't touch the cart!
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ Submit Payment
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
      await clearCartAfterPurchase(); // 🧹 clear cart
      handleGenerateBill();

      setTimeout(() => {
        navigate("/UserProfile");
      }, 2000);
    }, 2000);
  };

  // We use calculatedTotalAmount instead of calculating it again
  const total = calculatedTotalAmount;

  return (
    <div className="payment-container relative">
      {/* Dummy Processing Modal */}
      {processing && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
            <h2 className="text-xl font-bold">Processing Payment...</h2>
            <p className="text-gray-500 text-sm mt-2">Please do not close this window</p>
          </div>
        </div>
      )}

      {/* Dummy Success Modal */}
      {success && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white p-8 rounded-xl shadow-2xl flex flex-col items-center text-green-600">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">Payment Successful!</h2>
            <p className="text-gray-600 text-sm mt-2">Redirecting to profile...</p>
          </div>
        </div>
      )}

      <h2>Kick Couture - Checkout</h2>

      <div className="payment-box">
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Name:</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Email:</label>
            <input type="email" name="email" value={form.email} disabled required onChange={handleChange} />
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
