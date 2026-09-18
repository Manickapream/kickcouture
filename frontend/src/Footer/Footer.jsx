import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-section brand-section">
          <h2>KickCouture</h2>
          <p>Premium sneakers and footwear for everyone. Step up your style game with our exclusive collections.</p>
          <div className="social-icons">
            <a href="#"><FaFacebook /></a>
            <a href="#"><FaTwitter /></a>
            <a href="#"><FaInstagram /></a>
            <a href="#"><FaGithub /></a>
          </div>
        </div>

        <div className="footer-section links-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/collection">Collection</Link></li>
            <li><Link to="/cart">My Cart</Link></li>
            <li><Link to="/UserProfile">Profile</Link></li>
          </ul>
        </div>

        <div className="footer-section contact-section">
          <h3>Contact Us</h3>
          <p>Email: support@kickcouture.com</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Sneaker Street, NY 10001</p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} KickCouture. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
