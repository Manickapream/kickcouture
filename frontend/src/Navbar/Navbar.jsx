import React, { useState } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className='navbar'>
      <p className="logo">KickCouture</p>
      
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
        <li><Link to="/collection" onClick={() => setMenuOpen(false)}>Collection</Link></li>
        <li><Link to="/AboutUs" onClick={() => setMenuOpen(false)}>About</Link></li>
        <li className="login-item" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <span className="login-link">Login</span>
            <div className={`dropdown ${dropdownOpen ? 'show' : ''}`}>
              <Link to="/AdminLogin" onClick={() => setMenuOpen(false)}>Admin Login</Link>
              <Link to="/UserLogin" onClick={() => setMenuOpen(false)}>User Login</Link>
            </div>
            
        </li>
      </ul>
    </div>
  );
};

export default Navbar;
