import React, { useState, useEffect } from "react";
import "./Collection.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/Payment.jsx"


export const Collection = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState("Kids");
  const [selectedBrand, setSelectedBrand] = useState("Nike");
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  

  // 🆕 Buy Now Modal State
  const [buyNowProduct, setBuyNowProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    quantity: 1,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product/get");
      setProducts(res.data.data);
      setDisplayedProducts(res.data.data);
    } catch (err) {
      console.error("Error fetching products", err);
    }
  };

  const handleAddToCart = async (product) => {
    const email = localStorage.getItem("userEmail");
    if (!email) {
      alert("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/order/add", {
        email,
        productId: product._id,
        status: "cart",
      });
      alert(res.data.message);
    } catch (err) {
      console.error("Error adding to cart", err);
    }
  };

  const handleGenderChange = (e) => {
    setSelectedGender(e.target.value);
    const filteredProducts = products.filter(
      (product) =>
        product.gender.toLowerCase() === e.target.value.toLowerCase()
    );
    setDisplayedProducts(filteredProducts);
  };

  const handleBrandChange = (e) => {
    setSelectedBrand(e.target.value);
    const filteredProducts = products.filter(
      (product) =>
        product.brand.toLowerCase() === e.target.value.toLowerCase() &&
        product.gender.toLowerCase() === selectedGender.toLowerCase()
    );
    setDisplayedProducts(filteredProducts);
  };

    // 🆕 When user clicks Buy Now
   const handleBuyNow = (product) => {
    const storedEmail = localStorage.getItem("userEmail") || "";
    setBuyNowProduct(product);
    setFormData({
      name: "",
      email: storedEmail,
      address: "",
      phone: "",
      quantity: 1,
    });
  };

  // 🆕 Handle input change
   const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🆕 Increase / Decrease Quantity
  const updateQuantity = (delta) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + delta),
    }));
  };

  // 🆕 Make Payment
  const handleMakePayment = async () => {
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      alert("Please fill all details before proceeding.");
      return;
    }

    try {
      const totalPrice = buyNowProduct.price * formData.quantity;
      await axios.post("http://localhost:5000/api/order/add", {
        ...formData,
        productId: buyNowProduct._id,
        totalPrice,
        status: "paid",
      });

      alert("Order placed successfully!");
      setBuyNowProduct(null); // Close modal
      navigate("/UserProfile");
    } catch (err) {
      console.error("Error making payment", err);
      alert("Payment failed. Try again.");
    }
  };


  return (
    <div className="collection-container">
      <h2 className="collection-title">Collection</h2>

      {/* Drop+downs */}
      <div className="select-navbar">
        <div className="gender-select">
          <label htmlFor="gender">Select Gender: </label>
          <select id="gender" value={selectedGender} onChange={handleGenderChange}>
            {Array.from(new Set(products.map((p) => p.gender.toLowerCase()))).map(
              (gender) => (
                <option key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </option>
              )
            )}
          </select>
        </div>

        <div className="brand-select">
          <label htmlFor="brand">Select Brand: </label>
          <select id="brand" value={selectedBrand} onChange={handleBrandChange}>
            {Array.from(new Set(products.map((p) => p.brand.toLowerCase()))).map(
              (brand) => (
                <option key={brand} value={brand}>
                  {brand.charAt(0).toUpperCase() + brand.slice(1)}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {/* Product List */}
      <section className="best-selling">
        {displayedProducts.map((product) => (
          <div className="product-card" key={product._id}>
            <img src={"http://localhost:5000/" + product.image} alt={product.title} />
            <div className="product-info">
              <h1>{product.name}</h1>
              <h2>Size {product.size}</h2>
              <h3>₹ {product.price}</h3>
              <p>Brand {product.brand}</p>
              <p>{product.description}</p>
              <button onClick={() => handleAddToCart(product)}>Add to Cart 🛒</button>
              <button onClick={() => handleBuyNow(product)}>Buy Now</button>
            </div>
          </div>
        ))}
      </section>

      {/* 🆕 Buy Now Modal */}
      {buyNowProduct && (
        <div className="buy-now-modal">
          <div className="modal-content">
            <h2>Buy Now - {buyNowProduct.name}</h2>
            <img
              src={"http://localhost:5000/" + buyNowProduct.image}
              alt={buyNowProduct.name}
            />

            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />

            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />

            <label>Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
            />

            <label>Phone Number:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            <label>Quantity:</label>
            <div className="quantity-control">
              <button onClick={() => updateQuantity(-1)}>-</button>
              <span>{formData.quantity}</span>
              <button onClick={() => updateQuantity(1)}>+</button>
            </div>

            <h3>Total Price: ₹ {buyNowProduct.price * formData.quantity}</h3>
                <div className="modal-buttons">
                  {/* <button className="payment-btn" onClick={handleMakePayment}>  Make Payment</button> */}
                 <button className="payment-btn"
                    onClick={() => {
                          navigate("/payment", {  state: { product: buyNowProduct,orderDetails: formData, totalAmount: buyNowProduct.price * formData.quantity },
                            }); 
                           setBuyNowProduct(null);}}>
  Make Payment
</button>

                  <button className="cancel-btn" onClick={() => setBuyNowProduct(null)}>Cancel</button>
                </div>    
          </div>
        </div>
      )}
    </div>
  );
};
