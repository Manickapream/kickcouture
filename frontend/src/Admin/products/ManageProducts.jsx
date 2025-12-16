import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../products/ManageProducts.css";

function ManageProduct() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("");
  const [size, setSize] = useState("");
  const [brand, setBrand] = useState("");
  const [gender, setGender] = useState("");
  const [price, setPrice] = useState(99999);
  const [desc, setDesc] = useState("");
  const [count, setCount] = useState(0);

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch all products
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/product/get");
      setProducts(res.data.data);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  // ✅ Updated handleSubmit (merged and fixed)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("category", category);
    formData.append("size", size);
    formData.append("brand", brand);
    formData.append("gender", gender);
    formData.append("price", Number(price));
    formData.append("desc", desc);
    formData.append("count", count)
    if (image) formData.append("image", image);

    try {
      if (isEditing && editId) {
        // ✅ Edit mode
        await axios.put(`http://localhost:5000/api/product/${editId}`, formData);
        alert("✅ Product updated successfully!");
      } else {
        // ✅ Add mode
        await axios.post("http://localhost:5000/api/product/add", formData);
        alert("✅ Product added successfully!");
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("❌ Error submitting product:", error.response?.data || error.message);
      alert("⚠️ Error adding/updating product. Please check the console for details.");
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setImage(null);
    setCategory("");
    setSize("");
    setBrand("");
    setGender("");
    setPrice(0.0);
    setDesc("");
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
  };

  // Edit product handler
  const handleEdit = (product) => {
  setName(product.name);
  setCategory(product.category);
  setSize(product.size);
  setBrand(product.brand);
  setGender(product.gender);
  setPrice(product.price || 99999);
  setDesc(product.description || "");
  setCount(product.count || 0); 
  setEditId(product._id);
  setIsEditing(true);
  setShowForm(true);
  setImage(null);
};


  // Delete product handler
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`http://localhost:5000/api/product/${id}`);
        alert("🗑️ Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("❌ Error deleting product:", error.response?.data || error.message);
        alert("Error deleting product. Please check the console for details.");
      }
    }
  };

  // Navigate to dashboard
  const handleDashboard = () => {
    navigate("/Dashboard");
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <h1 className="logo">
          <span>Kick</span>Couture
        </h1>
        <button onClick={handleDashboard} className="logout-button">
          Dashboard
        </button>
      </div>

      {/* Add/Edit Form */}
      <div className="card">
        <div className="card-header">
          <h2>Manage Shoes</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="add-button">
              + Add New Shoe
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="form-grid">
            <div>
              <label className="input-label">Shoe Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Image</label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="form-file"
                required={!isEditing}
              />
            </div>

            <div>
              <label className="input-label">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Size</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="form-input"
                required
              />
            </div>

               <div>
              <label className="input-label">Count</label>
              <input
                type="Number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="input-label">Gender</label>
              <input
                type="text"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Price</label>
              <textarea
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="form-textarea"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="input-label">Description</label>
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="form-textarea"
                required
              />
            </div>

            <div className="button-group">
              <button type="submit" className="submit-button">
                {isEditing ? "Update Shoe" : "Submit Shoe"}
              </button>
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Product List */}
      <div className="card">
        <div className="card-header">
          <h2>Product List</h2>
        </div>
        <section className="best-selling">
          {products.map((product) => (
            <div className="product-card" key={product._id}>
             <img src={`http://localhost:5000/${product.image}`} alt={product.name} />

              <div className="product-info">
                <h1>{product.name}</h1> 
                <h2>Size: {product.size}</h2>
                <h3>₹ {product.price}</h3>
                <p>Brand: {product.brand}</p>
                <p>{product.description}</p>
                <div className="button-group">
                  {/* <button onClick={() => handleEdit(product)}>Edit</button> */}
                  <button onClick={() => handleDelete(product._id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default ManageProduct;
