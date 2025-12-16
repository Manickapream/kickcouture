// UserNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './UserNavbar.css';
import AboutUs  from '../../about/AboutUs';

const UserNavbar = ({ onLogout }) => {
  const [showSubMenu, setShowSubMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout(); // Return to old navbar
    navigate('/'); // Redirect to home
  };    

  return (
    <div className="navbar">
      <p className="logo">Kick<span>Couture</span></p>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/userProfile">Profile</Link></li>
        <li><Link to="/collection">Collection</Link></li>
        <li><Link to="/cart">Cart</Link></li>
        <li><Link to="/AboutUs">About</Link></li>
        <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
      </ul>
    </div>
  );
};

export default UserNavbar;
