import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Trends.css';
import api from "../api/axiosConfig";
import { FaShoppingCart, FaChevronLeft, FaChevronRight, FaCheckCircle } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Trends = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/product/get");
      // Slicing differently to differentiate from BestSelling for now
      // Or you can create a specific endpoint for trending items.
      setProducts(res.data.data.slice(0, 8).reverse()); 
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddToCart = async (product) => {
    const email = localStorage.getItem("userEmail");
    if (!email) { navigate('/UserLogin'); return; }
    try {
      const res = await api.post("/api/order/add", {
        email,
        productId: product._id,
        status: "cart",
      });
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(res.data.message || 'Added to cart!');
    } catch (err) {
      showToast('Failed to add to cart', 'error');
      console.error("Error adding to cart", err);
    }
  };

  const handleBuyNow = (product) => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) { navigate('/UserLogin'); return; }
    navigate("/payment", { state: { product, quantity: 1 } });
  };

  return (
    <div className="trends-scroll-section">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notif ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <FaCheckCircle style={{ marginRight: '8px', flexShrink: 0 }} />
          {toast.message}
        </div>
      )}
      {/* Left Arrow */}
      <button
        className={`scroll-arrow left-arrow ${!canScrollLeft ? 'arrow-hidden' : ''}`}
        onClick={() => scroll('left')}
        aria-label="Scroll Left"
      >
        <FaChevronLeft />
      </button>

      {/* Horizontal Scroll Track */}
      <div
        className="trends-products-scroll-track"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {products.map((product) => (
          <div className="trends-product-card" key={product._id}>
            <div className="trends-card-image-wrapper">
              <img src={`${API_BASE}/` + product.image} alt={product.name} />
            </div>
            <div className="trends-product-info">
              <div className="trends-product-header">
                <h1 className="trends-product-title">{product.name}</h1>
                <span className="trends-product-size">Size {product.size}</span>
              </div>
              <h3 className="trends-product-price">₹{product.price}</h3>
              <div className="trends-product-meta">
                <span className="trends-brand-badge">{product.brand}</span>
              </div>
              <p className="trends-product-desc">{product.description}</p>
              <div className="trends-product-actions">
                <button onClick={() => handleAddToCart(product)} className="btn-cart">
                  <FaShoppingCart style={{ marginRight: '6px' }} /> Add to Cart
                </button>
                {localStorage.getItem("userEmail") && (
                  <button onClick={() => handleBuyNow(product)} className="btn-buy">Buy Now</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        className={`scroll-arrow right-arrow ${!canScrollRight ? 'arrow-hidden' : ''}`}
        onClick={() => scroll('right')}
        aria-label="Scroll Right"
      >
        <FaChevronRight />
      </button>
    </div>
  );
};

export default Trends;
