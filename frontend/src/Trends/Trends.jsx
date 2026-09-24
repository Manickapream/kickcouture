import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Trends.css';
import api from "../api/axiosConfig";
import { FaChevronLeft, FaChevronRight, FaHeart } from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Trends = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <div className="trends-scroll-section">
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
          <div 
            className="trends-product-card" 
            key={product._id}
            onClick={() => handleProductClick(product._id)}
          >
            <div className="trends-card-header">
              <FaHeart className="trends-wishlist-icon" />
              <span className="trends-flash-sale">FLASH SALE</span>
            </div>
            <div className="trends-card-image-wrapper">
              <img src={`${API_BASE}/` + product.image} alt={product.name} />
            </div>
            <div className="trends-product-info">
              <p className="trends-brand">{product.brand}</p>
              <h1 className="trends-product-title">{product.name}</h1>
              <div className="trends-price-container">
                <h3 className="trends-product-price">MRP ₹{product.price}</h3>
                {product.originalPrice && (
                  <span className="trends-original-price">MRP ₹{product.originalPrice}</span>
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
