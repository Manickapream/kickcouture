import React, { useState, useEffect } from "react";
import "./Collection.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const Collection = () => {
  const navigate = useNavigate();
  const { isUserLoggedIn, userData } = useAuth();
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Dynamic brand list
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/product/get");
      const fetchedProducts = response.data.products || response.data.data || response.data;
      setProducts(fetchedProducts);

      // Extract unique brands dynamically
      const uniqueBrands = [...new Set(fetchedProducts.map(p => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    } catch (error) {
      console.error("Error fetching products", error);
    }
  };

  useEffect(() => {
    let filtered = products;

    if (selectedGender) {
      filtered = filtered.filter(
        (product) => product.gender.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter(
        (product) => product.brand.toLowerCase() === selectedBrand.toLowerCase()
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setDisplayedProducts(filtered);
  }, [selectedGender, selectedBrand, searchTerm, products]);

  // Navigate to single product page instead of directly to payment
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleWishlistClick = (e, product) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent product card click from firing

    if (!isUserLoggedIn || !userData?.email) {
      navigate('/UserLogin');
      return;
    }

    let wishlistItems = [];
    const stored = localStorage.getItem('wishlist');
    if (stored) {
      wishlistItems = JSON.parse(stored);
    }

    const isPresent = wishlistItems.some(item => item._id === product._id);
    
    if (isPresent) {
      // If already in wishlist, let's just go there to see it
      navigate('/wishlist');
    } else {
      wishlistItems.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
      window.dispatchEvent(new Event('wishlistUpdated'));
      navigate('/wishlist');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="collection-container">
          <h2 className="collection-title">NEW COLLECTION</h2>

          <div className="select-navbar">
            <div className="search-input">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="gender-select">
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Kids">Kids</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
              </select>
            </div>

            <div className="brand-select">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <section className="best-selling">
            {displayedProducts.map((product) => (
              <div
                className="product-card"
                key={product._id}
                onClick={() => handleProductClick(product._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-card-header">
                  <FaHeart 
                    className="wishlist-icon" 
                    onClick={(e) => handleWishlistClick(e, product)}
                    title="Add to Wishlist"
                  />
                  {product.isOnSale && <span className="flash-sale-tag">FLASH SALE</span>}
                </div>
                <div className="image-container">
                  <img src={`${API_BASE}/${product.image}`} alt={product.name} />
                </div>
                <div className="product-info">
                  <p className="product-brand">{product.brand}</p>
                  <h3>{product.name}</h3>
                  <div className="price-container">
                    <p className="price">MRP ₹{product.price}</p>
                    {product.originalPrice && (
                      <p className="original-price">MRP ₹{product.originalPrice}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};
