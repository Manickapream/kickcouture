import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './BestSelling.css';
import api from "../api/axiosConfig";
import {
  FaShoppingBag,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
} from 'react-icons/fa';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const BestSelling = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [toast, setToast] = useState(null);
  const [wishlist, setWishlist] = useState({});

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/product/get");
      setProducts(res.data.data);
    } catch (err) { console.error("Error fetching products", err); }
  };

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleWishlist = (id) =>
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));

  const handleAddToCart = async (product) => {
    const email = localStorage.getItem("userEmail");
    if (!email) { navigate('/UserLogin'); return; }
    try {
      const res = await api.post("/api/order/add", { email, productId: product._id, status: "cart" });
      window.dispatchEvent(new Event('cartUpdated'));
      showToast(res.data.message || 'Added to cart!');
    } catch (err) { showToast('Failed to add to cart', 'error'); }
  };

  const handleBuyNow = (product) => {
    const email = localStorage.getItem("userEmail");
    if (!email) { navigate('/UserLogin'); return; }
    navigate("/payment", { state: { product, quantity: 1 } });
  };

  const fakeOriginal = (price) => Math.round(price * 2);

  return (
    <div className="scroll-section">
      {toast && (
        <div className={`toast-notif ${toast.type === 'error' ? 'toast-error' : 'toast-success'}`}>
          <FaCheckCircle style={{ marginRight: '8px', flexShrink: 0 }} />
          {toast.message}
        </div>
      )}

      <button className={`scroll-arrow left-arrow ${!canScrollLeft ? 'arrow-hidden' : ''}`}
        onClick={() => scroll('left')} aria-label="Scroll Left">
        <FaChevronLeft />
      </button>

      <div className="products-scroll-track" ref={scrollRef} onScroll={handleScroll}>
        {products.map((product) => (
          <div className="product-card" key={product._id}>

            {/* IMAGE AREA */}
            <div className="card-image-wrapper">
              <span className="flash-badge">FLASH SALE</span>
              <button
                className={`wishlist-btn ${wishlist[product._id] ? 'wished' : ''}`}
                onClick={() => toggleWishlist(product._id)}
                aria-label="Wishlist"
              >
                <FaHeart />
              </button>
              <img
                src={`${API_BASE}/` + product.image}
                alt={product.name}
                onClick={() => navigate(`/product/${product._id}`)}
              />
            </div>

            {/* BRAND BAR */}
            <div className="card-brand-bar">
              <span className="card-brand-name">{product.brand}</span>
              <button className="card-cart-btn" onClick={() => handleAddToCart(product)} aria-label="Add to cart">
                <FaShoppingBag />
              </button>
            </div>

            {/* PRODUCT INFO */}
            <div className="product-info" onClick={() => navigate(`/product/${product._id}`)}>
              <p className="product-brand-label">{product.brand?.toUpperCase()}</p>
              <h3 className="product-title">{product.name?.toUpperCase()}</h3>
              <div className="product-price-row">
                <span className="price-mrp-label">MRP </span>
                <span className="price-current">&#8377;{product.price?.toLocaleString('en-IN')}</span>
                <span className="price-original">MRP &#8377;{fakeOriginal(product.price)?.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        ))}
      </div>

      <button className={`scroll-arrow right-arrow ${!canScrollRight ? 'arrow-hidden' : ''}`}
        onClick={() => scroll('right')} aria-label="Scroll Right">
        <FaChevronRight />
      </button>
    </div>
  );
};

export default BestSelling;
