import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../products/ManageProducts.css";
import adminService from "../../services/adminService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const emptyForm = {
  name: '', category: '', size: '', brand: '', color: '',
  gender: '', price: '', originalPrice: '', desc: '', count: '',
  manufacturedBy: '', countryOfOrigin: 'India', consumerComplaints: '', vendorId: ''
};

function ManageProduct() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const additionalFileInputRef = useRef(null);

  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const res = await adminService.getVendors('approved');
      setVendors(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching vendors:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await adminService.getProducts();
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("❌ Error fetching products:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert("You can only upload a maximum of 4 additional images.");
      e.target.value = ''; // Reset input
      return;
    }
    setAdditionalImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append("image", image);
    additionalImages.forEach((img) => {
      formData.append('additionalImages', img);
    });

    try {
      if (isEditing && editId) {
        await adminService.updateProduct(editId, formData);
        alert("✅ Product updated successfully!");
      } else {
        await adminService.addProduct(formData);
        alert("✅ Product added successfully!");
      }
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("❌ Error submitting product:", error.response?.data || error.message);
      alert("⚠️ Error adding/updating product. Please check the console for details.");
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImage(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setAdditionalImagePreviews([]);
    setShowForm(false);
    setIsEditing(false);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, category: p.category, size: p.size, brand: p.brand, color: p.color || '',
      gender: p.gender, price: p.price, originalPrice: p.originalPrice || '', desc: p.description || '', count: p.count || 0,
      manufacturedBy: p.manufacturedBy || '', countryOfOrigin: p.countryOfOrigin || 'India', consumerComplaints: p.consumerComplaints || '',
      vendorId: p.vendorId || ''
    });
    setImagePreview(`${API_BASE}/${p.image}`);
    if (p.additionalImages && p.additionalImages.length > 0) {
      setAdditionalImagePreviews(p.additionalImages.map(img => `${API_BASE}/${img}`));
    } else {
      setAdditionalImagePreviews([]);
    }
    setEditId(p._id);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminService.deleteProduct(id);
        alert("🗑️ Product deleted successfully!");
        fetchProducts();
      } catch (error) {
        console.error("❌ Error deleting product:", error.response?.data || error.message);
        alert("Error deleting product. Please check the console for details.");
      }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/Dashboard" className="back-link">← Dashboard</Link>
          <h1>Manage Products (Super Admin)</h1>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Product Editor</h2>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="add-button">
              + Add New Product
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
            <div className="fg" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label" style={{ fontWeight: 'bold', color: '#e52e71' }}>Assign to Vendor</label>
              <select name="vendorId" value={form.vendorId} onChange={handleChange} className="form-input" style={{ border: '2px solid #e52e71', backgroundColor: '#fff0f5' }}>
                <option value="">None (Admin's Product)</option>
                {vendors.map(v => (
                  <option key={v._id} value={v._id}>{v.businessName} ({v.email})</option>
                ))}
              </select>
            </div>

            <div className="fg">
              <label className="input-label">Product Name *</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Brand *</label>
              <input name="brand" type="text" value={form.brand} onChange={handleChange} className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Category *</label>
              <input name="category" type="text" value={form.category} onChange={handleChange} className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Size(s) *</label>
              <input name="size" type="text" value={form.size} onChange={handleChange} placeholder="e.g. S, M, L or UK 7, 8" className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="form-input" required>
                <option value="">Select Gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
                <option value="Kids">Kids</option>
              </select>
            </div>

            <div className="fg">
              <label className="input-label">Color *</label>
              <input name="color" type="text" value={form.color} onChange={handleChange} placeholder="e.g. Black/Red" className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Selling Price (₹) *</label>
              <input name="price" type="number" min="0" value={form.price} onChange={handleChange} className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Original Price (MRP ₹)</label>
              <input name="originalPrice" type="number" min="0" value={form.originalPrice} onChange={handleChange} className="form-input" />
            </div>

            <div className="fg">
              <label className="input-label">Stock Count *</label>
              <input name="count" type="number" min="0" value={form.count} onChange={handleChange} className="form-input" required />
            </div>

            <div className="fg">
              <label className="input-label">Manufactured By</label>
              <input name="manufacturedBy" type="text" value={form.manufacturedBy} onChange={handleChange} className="form-input" />
            </div>

            <div className="fg">
              <label className="input-label">Country of Origin</label>
              <input name="countryOfOrigin" type="text" value={form.countryOfOrigin} onChange={handleChange} className="form-input" />
            </div>

            <div className="fg">
              <label className="input-label">Main Image {!isEditing && '*'}</label>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="form-file" required={!isEditing} />
              {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '80px', marginTop: '10px', borderRadius: '4px' }} />}
            </div>

            <div className="fg" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Additional Images (Max 4)</label>
              <input ref={additionalFileInputRef} type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} className="form-file" />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                {additionalImagePreviews.map((src, idx) => (
                  <img key={idx} src={src} alt="Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                ))}
              </div>
            </div>

            <div className="fg" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Consumer Complaints Contact</label>
              <input name="consumerComplaints" type="text" value={form.consumerComplaints} onChange={handleChange} className="form-input" />
            </div>

            <div className="fg" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">Description *</label>
              <textarea name="desc" value={form.desc} onChange={handleChange} rows="4" className="form-textarea" required />
            </div>

            <div className="button-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button type="submit" className="submit-button">
                {isEditing ? "Update Product" : "Submit Product"}
              </button>
              <button type="button" onClick={resetForm} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Product Catalog</h2>
        </div>
        <section className="best-selling">
          {products.map((product) => (
            <div className="product-card" key={product._id} style={{ position: 'relative' }}>
              {product.vendorId && (
                <div style={{ position: 'absolute', top: 10, left: 10, background: '#e52e71', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '10px' }}>
                  {vendors.find(v => v._id === product.vendorId)?.businessName || 'Vendor Product'}
                </div>
              )}
              <img src={`${API_BASE}/${product.image}`} alt={product.name} />

              <div className="product-info">
                <h1>{product.name}</h1> 
                <h2 style={{ fontSize: '12px', color: '#666' }}>{product.brand} | {product.category} | Size: {product.size}</h2>
                <h2 style={{ fontSize: '12px', color: '#666' }}>Color: {product.color} | Stock: {product.count}</h2>
                
                <h3 style={{ margin: '8px 0' }}>
                  ₹{product.price}{" "}
                  {product.originalPrice && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px', marginLeft: '5px' }}>₹{product.originalPrice}</span>}
                </h3>
                
                <p style={{ maxHeight: '40px', overflow: 'hidden' }}>{product.description}</p>
                
                <div className="button-group" style={{ marginTop: '10px' }}>
                  <button onClick={() => handleEdit(product)} style={{ background: '#4CAF50', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Edit</button>
                  <button onClick={() => handleDelete(product._id)} style={{ background: '#f44336', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>Delete</button>
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
