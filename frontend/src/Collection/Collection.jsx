import React, { useState, useEffect } from "react";
import "./Collection.css";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { FaShoppingCart } from 'react-icons/fa';

export const Collection = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("Kids");
  const [selectedBrand, setSelectedBrand] = useState("Nike");
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/api/product");
      setProducts(response.data.products || response.data);
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

  const handleAddToCart = async (product) => {
    try {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        navigate('/UserLogin');
        return;
      }
      const res = await api.post("/api/order/add", {
        email,
        productId: product._id,
        status: "cart",
      });
      window.dispatchEvent(new Event('cartUpdated'));
      alert(res.data.message || 'Added to cart!');
    } catch (err) {
      console.error("Error adding to cart", err);
      alert("Error adding to cart");
    }
  };

  const handleBuyNow = (product) => {
    const storedEmail = localStorage.getItem("userEmail");
    if (!storedEmail) {
      navigate('/UserLogin');
      return;
    }
    
    navigate("/payment", {  
      state: { 
        product: product,
        quantity: 1
      }
    }); 
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
                <option value="Nike">Nike</option>
                <option value="Adidas">Adidas</option>
                <option value="Crocs">Crocs</option>
              </select>
            </div>
          </div>

          <section className="best-selling">
            {displayedProducts.map((product) => (
              <div className="product-card" key={product._id}>
                <div className="image-container">
                  <img src={"http://localhost:5000/" + product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h1>{product.name}</h1>
                  <h2>Size {product.size}</h2>
                  <h3>₹ {product.price}</h3>
                  <p>{product.brand} - {product.description}</p>
                  
                  <div className="product-actions">
                    <button className="add-cart-btn" onClick={() => handleAddToCart(product)}>
                      Add to Cart <FaShoppingCart />
                    </button>
                    {localStorage.getItem("userEmail") && (
                      <button className="buy-now-btn" onClick={() => handleBuyNow(product)}>Buy Now</button>
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
