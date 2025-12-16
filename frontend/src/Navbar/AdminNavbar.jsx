// UserNavbar.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminNavbar.css';

const AdminNavbar = ({ onLogout }) => {
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
        <li><button onClick={handleLogout} className="logout-btn">Admin Logout</button></li>
      </ul>
    </div>
  );
};

export default AdminNavbar;