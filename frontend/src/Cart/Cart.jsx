import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaShoppingCart, FaMoneyBillWave } from 'react-icons/fa';

export const Cart = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const email = localStorage.getItem("userEmail");
      const res = await api.get(`/api/order/cart/${email}`);
      setProducts(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleRemoveFromCart = async (product) => {
    try {
      await api.delete(`/api/order/${product._id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  const totalPrice = () => {
    return products.reduce((total, product) => total + (product.productId?.price || 0), 0);
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
            return (
              <div className="cart-item" key={order._id}>
                <div className="cart-item-image">
                  <img src={"http://localhost:5000/" + product.image} alt={product.name} />
                </div>
                <div className="cart-item-details">
                  <h1>{product.name}</h1>
                  <h2>Size {product.size}</h2>
                  <h3>₹ {product.price}</h3>
                  <p>{product.brand} - {product.description}</p>
                  
                  <div className="cart-item-actions">
                    <button className="remove-btn" onClick={() => handleRemoveFromCart(order)}>
                      Remove <FaShoppingCart />
                    </button>
                    <button 
                      className="pay-now-btn"
                      onClick={() => navigate("/payment", { state: { product: product, quantity: 1, cartOrderId: order._id } })}
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
