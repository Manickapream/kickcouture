import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Cart = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order/all");
      const email = localStorage.getItem("userEmail");
      const filter = res.data.orders.filter(
        (order) => order.email === email && order.status === "cart"
      );
      setProducts(filter);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleRemoveFromCart = async (product) => {
    try {
      await axios.delete(`http://localhost:5000/api/order/${product._id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  const totalPrice = () => {
    return products.reduce((total, product) => total + product.productId.price, 0);
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
    <div className="collection-container">
      <h2 className="collection-title">Cart</h2>

      <div className="select-navbar">
        <div className="gender-select">
          <label>Total Price : ₹ {totalPrice()} </label>
        </div>

        <div className="brand-select">
          <button
            onClick={handleBuyAll}
            className="buy-all-button"
            style={{
              backgroundColor: "black",
              color: "white",
              borderRadius: "8px",
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Buy All
          </button>
        </div>
      </div>

      <section className="best-selling">
        {products.map((order) => {
          const product = order.productId;
          return (
            <div className="product-card" key={order._id}>
              <img
                src={"http://localhost:5000/" + product.image}
                alt={product.name}
              />
              <div className="product-info">
                <h1>{product.name}</h1>
                <h2>size {product.size}</h2>
                <h3>₹ {product.price}</h3>
                <p>brand {product.brand}</p>
                <p>{product.description}</p>
                <button onClick={() => handleRemoveFromCart(order)}>
                  Remove from Cart 🛒
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
