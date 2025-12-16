import React, { useState, useEffect } from 'react';
import './OldOrders.css';
import { useNavigate } from 'react-router-dom';
import axios from "axios";

export const OldOrders = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all orders and filter by current user's email
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order/all");
      const email = localStorage.getItem("userEmail");
      const filteredOrders = res.data.orders.filter(order => order.email === email);
      const oldOrders = filteredOrders.filter(order => order.status !== "cart");
      setProducts(oldOrders);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  // Delete order by ID
 const handleDeleteOrder = async (orderId, status) => {
  if (status === "approved") {
    alert("❌ Approved orders cannot be deleted!");
    return;
  }
  try {
    await axios.delete(`http://localhost:5000/api/order/${orderId}`);
    alert("Order deleted successfully!");
    fetchProducts();
  } catch (err) {
    console.error("Error deleting order", err);
    alert("Error deleting order. Please try again.");
  }
};


  // Add product back to cart
  const handleAddToCart = async (product) => {
    try {
      const res = await axios.post("http://localhost:5000/api/order/add", {
        _id: product._id,
        email: product.email,
        productId: product.productId,
        status: "pending",
        createdAt: new Date()
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  // Remove from cart
  const handleRemoveFromCart = async (product) => {
    try {
      await axios.delete(`http://localhost:5000/api/order/${product._id}`);
      fetchProducts();
    } catch (err) {
      console.error("Error removing from cart", err);
    }
  };

  // Buy now action
  const handleBuyNow = (product) => {
    alert(`Buying ${product.productId.name}`);
    handleRemoveFromCart(product); 
    handleAddToCart(product);
  };

  // Redirect handler
  const handleRedirect = (path) => {
    navigate(path);
  };

  return (
    <div className="collection-container">
      <h2 className='collection-title'>Orders</h2>
      <section className="best-selling">
        {products.map((order) => {
          const product = order.productId;
          return (
            <div className="product-card" key={order._id}>
              <img src={"http://localhost:5000/" + product.image} alt={product.title} />
              <div className="product-info">
                {/* <h5>{order._id}</h5> */}
                <h1>{product.name}</h1>
                <h2>STATUS: {order.status}</h2>
                <h2>size {product.size}</h2>
                <h3>₹ {product.price}</h3>
                <p>brand {product.brand}</p>
                <p>{product.description}</p>
                <p>{order.createdAt}</p>
                {order.status !== "approved" && (
                    <button onClick={() => handleDeleteOrder(order._id, order.status)}>  Delete</button>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
};
