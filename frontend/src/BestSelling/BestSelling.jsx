import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BestSelling.css';
import heroImg from '../assets/img1.jpeg';
import { useState, useEffect } from "react";
import axios from "axios";

const BestSelling = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
    // 🆕 Buy Now Modal State
    const [buyNowProduct, setBuyNowProduct] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      address: "",
      phone: "",
      quantity: 1,
    });

  const [products, setProducts] = useState([]);
    useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product/get");
      setProducts(res.data.data.slice(0, 3));
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleAddToCart = (product) => {
    if (!isLoggedIn) {
      navigate('/UserLogin');
    } else {
      console.log("Added to cart:", product.title);
      // Implement actual cart logic here
    }
  };

    // 🆕 When user clicks Buy Now
   const handleBuyNow = (product) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    setBuyNowProduct(product);
    setFormData({
      name: "",
      email: storedEmail,
      address: "",
      phone: "",
      quantity: 1,
    });
  };

  // 🆕 Handle input change
   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🆕 Increase / Decrease Quantity
  const updateQuantity = (delta) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  // 🆕 Make Payment
  const handleMakePayment = async () => {
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      alert("Please fill all details before proceeding.");
      return;
    }

    try {
      const totalPrice = buyNowProduct.price * formData.quantity;
      await axios.post("http://localhost:5000/api/order/add", {
        ...formData,
        productId: buyNowProduct._id,
        totalPrice,
        status: "paid",
      });

      alert("Order placed successfully!");
      setBuyNowProduct(null); // Close modal
      navigate("/UserProfile");
    } catch (err) {
      console.error("Error making payment", err);
      alert("Payment failed. Try again.");
    }
  };

  

  return (
    <section className="best-selling">
      {products.map((product) => (
        <div className="product-card" key={product._id}>
          <img src={"http://localhost:5000/" + product.image} alt={product.title} />
          <div className="product-info">
            <h1>{product.name}</h1>
            <h2>size {product.size}</h2>
            <h3>₹ {product.price}</h3>
            <p>brand {product.brand}</p>
            <p>{product.description}</p>
            <button onClick={() => handleAddToCart(product)}>Add to Cart 🛒</button>
           
          </div>
        </div>
      ))}
    </section>
  );
};

export default BestSelling;
