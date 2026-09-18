import React from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';
import heroImg from '../assets/red_shoe.jpg';
import Trends from '../Trends/Trends';
import { FaTruck, FaUndo, FaShieldAlt, FaStar } from 'react-icons/fa';

export const Hero = () => {
  return (
    <>
      {/* ── HERO BANNER ── */}
      <div className="hero-page-wrapper">
        <div className="hero-card">
          <img src={heroImg} alt="KickCouture Banner" className="hero-banner-image" />
        </div>
      </div>


      {/* ── FEATURES STRIP (Trust Signals) ── */}
      <div className="features-wrapper">
        <div className="features-card">
          <div className="features-strip">
            <div className="feature-item">
              <div className="feature-icon-box">
                <FaTruck />
              </div>
              <div className="feature-text">
                <strong>Free Delivery</strong>
                <span>On orders above ₹999</span>
              </div>
            </div>

            <div className="feature-divider" />

            <div className="feature-item">
              <div className="feature-icon-box">
                <FaUndo />
              </div>
              <div className="feature-text">
                <strong>Easy Returns</strong>
                <span>7-day hassle-free return</span>
              </div>
            </div>

            <div className="feature-divider" />

            <div className="feature-item">
              <div className="feature-icon-box">
                <FaShieldAlt />
              </div>
              <div className="feature-text">
                <strong>Secure Payment</strong>
                <span>100% safe &amp; encrypted</span>
              </div>
            </div>

            <div className="feature-divider" />

            <div className="feature-item">
              <div className="feature-icon-box">
                <FaStar />
              </div>
              <div className="feature-text">
                <strong>Authentic Products</strong>
                <span>Certified genuine brands</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TRENDS SECTION ── */}
      <div className="page-wrapper" style={{ minHeight: 'auto', paddingTop: '0' }}>
        <div className="page-card">
          <div className="trends-header">
            <div className="trends-title-row">
              <div>
                <h2>TRENDS</h2>
                <p>Explore our most popular picks of the season</p>
              </div>
              <Link to="/collection" className="view-all-btn">View All →</Link>
            </div>
          </div>
          <Trends />
        </div>
      </div>
    </>
  );
};
