import React from 'react';
import { useState } from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';
import heroImg from '../assets/img1.jpeg'; // Your uploaded image
import BestSelling from '../BestSelling/BestSelling';


export const Hero = () => {
  return (
    <>
    <section className="hero">
      <div className="hero-left">
        <h1>
          Step Into The Future With <span>Style</span>
        </h1>
        <p>
          Discover our latest collection of premium footwear designed for comfort,
          performance, and unmatched style.
        </p>
        <div className="cta-buttons">
          <Link to="/shop" className="btn primary">Shop Collection</Link>
          <Link to="/UserProfile" className="btn secondary">Explore Features</Link>
        </div>
      </div>
      <div className="hero-right">
        <img src={heroImg} alt="Product" className="product-image" />
      </div>

      
    </section>
    <div className="best-selling"> <h1> TRENDS</h1></div>
  <BestSelling/>
  </>
  );
};
