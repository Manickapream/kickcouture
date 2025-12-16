import React from 'react';
import './AboutUs.css';
import teamImage from '../src/assets/img1.jpeg'; // use an actual image here '../assets/img1.jpeg'

const AboutUs = () => {
  return (
    <div className="about-container">
      <section className="about-hero">
        <h1>About Kick<span>Couture</span></h1>
        <p>Where Style Meets Comfort — One Step at a Time</p>
      </section>

      <section className="about-content">
        <div className="about-text">
          <h2>Our Story</h2>
          <p>
            KickCouture was born from a love for fashion and sneakers. We blend premium design with unmatched comfort to
            create shoes that empower movement and self-expression. Whether you're walking city streets or owning the
            runway, our collections are crafted to keep you bold and confident.
          </p>

          <h2>What We Stand For</h2>
          <ul>
            <li>✔️ Uncompromising Quality</li>
            <li>✔️ Trend-Driven Designs</li>
            <li>✔️ Eco-Friendly Practices</li>
            <li>✔️ Customer-First Philosophy</li>
          </ul>
        </div>

        <div className="about-image">
          <img src={teamImage} alt="KickCouture Team" />
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
