// UserNavbar.jsx — With cart badge, active links, animated hamburger, toast
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart } from 'react-icons/fa';
import './UserNavbar.css';

const UserNavbar = ({ onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      if (!email) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/order/cart/${email}`);
      const data = await res.json();
      setCartCount(data.orders ? data.orders.length : 0);
      
      // Trigger animation
      setAnimateBadge(true);
      setTimeout(() => setAnimateBadge(false), 300);
    } catch {
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
    
    // Listen for custom add-to-cart events
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [location]); // Refresh on every navigation

  // Navbar glass effect on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="logo">KickCouture</Link>

      {/* Hamburger */}
      <div
        className={`menu-icon ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Nav Links */}
      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li>
          <Link
            to="/"
            className={isActive('/') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >Home</Link>
        </li>
        <li>
          <Link
            to="/collection"
            className={isActive('/collection') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >Collection</Link>
        </li>
        <li>
          <Link
            to="/AboutUs"
            className={isActive('/AboutUs') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >About</Link>
        </li>
        <li>
          <Link
            to="/cart"
            className={`cart-link ${isActive('/cart') ? 'active-link' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart />
            {cartCount > 0 && <span className={`cart-badge ${animateBadge ? 'pop-animation' : ''}`}>{cartCount}</span>}
          </Link>
        </li>
        <li>
          <Link
            to="/userProfile"
            className={isActive('/userProfile') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >Profile</Link>
        </li>
        <li>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default UserNavbar;
