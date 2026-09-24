import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBoxOpen, FaClipboardList, FaUserAlt } from 'react-icons/fa';
import './VendorMobileNav.css';

const VendorMobileNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="vendor-mobile-nav">
      <Link to="/vendor-dashboard" className={`mobile-nav-item ${path === '/vendor-dashboard' ? 'active' : ''}`}>
        <FaHome className="mobile-nav-icon" />
        <span>Home</span>
      </Link>
      <Link to="/vendor-products" className={`mobile-nav-item ${path === '/vendor-products' ? 'active' : ''}`}>
        <FaBoxOpen className="mobile-nav-icon" />
        <span>Products</span>
      </Link>
      <Link to="/vendor-orders" className={`mobile-nav-item ${path === '/vendor-orders' ? 'active' : ''}`}>
        <FaClipboardList className="mobile-nav-icon" />
        <span>Orders</span>
      </Link>
      <Link to="/vendor-profile" className={`mobile-nav-item ${path === '/vendor-profile' ? 'active' : ''}`}>
        <FaUserAlt className="mobile-nav-icon" />
        <span>Profile</span>
      </Link>
    </div>
  );
};

export default VendorMobileNav;
