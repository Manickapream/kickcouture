import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import './Wishlist.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = () => {
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      setWishlistItems(JSON.parse(stored));
    }
  };

  const removeFromWishlist = (id) => {
    const updated = wishlistItems.filter(item => item._id !== id);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  return (
    <div className="wishlist-container">
      <h1 className="wishlist-title">My Wishlist</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="wishlist-empty">
          <p>Your wishlist is currently empty.</p>
          <Link to="/collection" className="btn-continue-shopping">Continue Shopping</Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlistItems.map(item => (
            <div key={item._id} className="wishlist-card">
              <Link to={`/product/${item._id}`} className="wishlist-img-link">
                <img src={`${API_BASE}/${item.image}`} alt={item.name} />
              </Link>
              <div className="wishlist-info">
                <p className="wishlist-brand">{item.brand}</p>
                <Link to={`/product/${item._id}`} className="wishlist-name-link">
                  <h3 className="wishlist-name">{item.name}</h3>
                </Link>
                <p className="wishlist-price">₹{item.price}</p>
                <button 
                  className="btn-remove-wishlist" 
                  onClick={() => removeFromWishlist(item._id)}
                  title="Remove from Wishlist"
                >
                  <FaTrash /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
