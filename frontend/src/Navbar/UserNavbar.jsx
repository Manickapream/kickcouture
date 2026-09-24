import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaUser, FaBell } from 'react-icons/fa';
import './UserNavbar.css';

const UserNavbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateBadge, setAnimateBadge] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch cart count
  const fetchCartCount = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('userToken');
      if (!email) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/order/cart/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setCartCount(data.orders ? data.orders.length : 0);

      // Trigger animation
      setAnimateBadge(true);
      setTimeout(() => setAnimateBadge(false), 300);
    } catch {
      setCartCount(0);
    }
  };

  const fetchNotifications = async () => {
    try {
      const email = localStorage.getItem('userEmail');
      const token = localStorage.getItem('userToken');
      if (!email) return;
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/order/?email=${email}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.orders) {
        // Find orders canceled within last 48 hours
        const recentCanceled = data.orders.filter(o => 
          o.status === 'canceled' && 
          o.canceledAt && 
          (Date.now() - new Date(o.canceledAt).getTime()) < (48 * 60 * 60 * 1000)
        );
        
        const lastRead = localStorage.getItem('notificationsLastRead');
        const lastReadTime = lastRead ? parseInt(lastRead) : 0;
        
        let unread = 0;
        recentCanceled.forEach(notif => {
          if (new Date(notif.canceledAt).getTime() > lastReadTime) {
            unread++;
          }
        });

        setNotifications(recentCanceled);
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchCartCount();
    fetchNotifications();

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
            to="/old-orders"
            className={isActive('/old-orders') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >Orders</Link>
        </li>
        <li>
          <Link
            to="/AboutUs"
            className={isActive('/AboutUs') ? 'active-link' : ''}
            onClick={() => setMenuOpen(false)}
          >About</Link>
        </li>
        <li className="mobile-icon-row">
          <div className="nav-notification-wrapper" style={{ position: 'relative' }}>
            <button 
              className="cart-link notification-btn"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (!notificationOpen) {
                  localStorage.setItem('notificationsLastRead', Date.now().toString());
                  setUnreadCount(0);
                }
              }}
              title="Notifications"
              style={{ border: 'none', cursor: 'pointer', background: 'transparent', color: '#333' }}
            >
              <FaBell />
              {unreadCount > 0 && <span className="cart-badge">{unreadCount}</span>}
            </button>
            {notificationOpen && (
              <div className="notification-dropdown">
                <div className="notif-header">Notifications</div>
                <div className="notif-body">
                  {notifications.length === 0 ? (
                    <div className="notif-item" style={{ justifyContent: 'center', color: '#64748b', padding: '30px 20px' }}>
                      No new notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div className="notif-item" key={notif._id}>
                        <div className="notif-icon">⚠️</div>
                        <div className="notif-content">
                          <strong>Order Canceled</strong>
                          <p>Your order for <b>{notif.productId?.name || 'an item'}</b> was canceled by the vendor.</p>
                          {notif.cancelReason && <p style={{ color: '#dc2626', marginTop: '4px' }}>Reason: {notif.cancelReason}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <Link
            to="/wishlist"
            className={`cart-link ${isActive('/wishlist') ? 'active-link' : ''}`}
            onClick={() => setMenuOpen(false)}
            title="Wishlist"
          >
            <FaHeart />
          </Link>
          <Link
            to="/cart"
            className={`cart-link ${isActive('/cart') ? 'active-link' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FaShoppingCart />
            {cartCount > 0 && <span className={`cart-badge ${animateBadge ? 'pop-animation' : ''}`}>{cartCount}</span>}
          </Link>
          {localStorage.getItem('userToken') ? (
            <Link
              to="/UserProfile"
              className={`cart-link ${isActive('/UserProfile') ? 'active-link' : ''}`}
              onClick={() => setMenuOpen(false)}
              title="Profile"
            >
              <FaUser />
            </Link>
          ) : (
            <Link
              to="/UserLogin"
              className="navbar-login-btn"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </li>
      </ul>
    </div>
  );
};

export default UserNavbar;
