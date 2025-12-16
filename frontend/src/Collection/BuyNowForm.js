// src/components/BuyNowForm.js

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const BuyNowForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const product = location.state?.product;

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phoneNumber: ''
    });

    if (!product) {
        return <p>Product not found. Please go back to the collection page.</p>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically handle the form submission, e.g., send data to a backend server
        console.log("Order submitted:", { product, ...formData });
        
        alert("Your order has been placed successfully!");
        navigate("/collection"); // Redirect back to the collection page
    };

    return (
        <div className="buy-now-form-container">
            <h2>Complete Your Purchase</h2>
            <div className="product-summary">
                <h3>{product.name}</h3>
                <p>Price: ₹{product.price}</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Shipping Address:</label>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone Number:</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Place Order</button>
            </form>
        </div>
    );
};