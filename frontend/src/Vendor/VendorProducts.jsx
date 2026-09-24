import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import VendorMobileNav from './VendorMobileNav';
import './VendorProducts.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const emptyForm = {
  name: '', category: '', size: '', brand: '', color: '',
  gender: '', price: '', originalPrice: '', desc: '', count: '',
  manufacturedBy: '', countryOfOrigin: 'India', consumerComplaints: ''
};

const VendorProducts = () => {
  const { logoutVendor } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const additionalFileInputRef = useRef();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await vendorService.getProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError('');
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

  const validate = () => {
    if (!form.name || !form.category || !form.size || !form.brand || !form.gender || !form.color)
      return 'Name, category, size, brand, gender, and color are required.';
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) < 0)
      return 'Please enter a valid selling price.';
    if (!isEditing && !image)
      return 'Product image is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setFormError(err); return; }

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => formData.append(k, v));
    if (image) formData.append('image', image);
    additionalImages.forEach((img) => {
      formData.append('additionalImages', img);
    });

    setSubmitting(true);
    try {
      if (isEditing) {
        await vendorService.updateProduct(editId, formData);
        alert('✅ Product updated successfully!');
      } else {
        await vendorService.addProduct(formData);
        alert('✅ Product added! It is now live on the store.');
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
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
    setFormError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (additionalFileInputRef.current) additionalFileInputRef.current.value = '';
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, category: p.category, size: p.size, brand: p.brand, color: p.color || '',
      gender: p.gender, price: p.price, originalPrice: p.originalPrice || '', desc: p.description || '', count: p.count || 0,
      manufacturedBy: p.manufacturedBy || '', countryOfOrigin: p.countryOfOrigin || 'India', consumerComplaints: p.consumerComplaints || ''
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
    setImage(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await vendorService.deleteProduct(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="vp-container">
      {/* Sidebar */}
      <div className="vp-sidebar">
        <div className="sidebar-brand"><h2><span className="accent">Kick</span>Couture</h2><p>Vendor Portal</p></div>
        <nav className="sidebar-nav">
          <Link to="/vendor-dashboard" className="nav-item">🏠 Dashboard</Link>
          <Link to="/vendor-products" className="nav-item active">👟 My Products</Link>
          <Link to="/vendor-orders" className="nav-item">📦 My Orders</Link>
          <Link to="/vendor-profile" className="nav-item">👤 Profile</Link>
        </nav>
        <button className="logout-btn" onClick={() => { logoutVendor(); navigate('/vendor-login'); }}>← Logout</button>
      </div>

      {/* Main */}
      <div className="vp-main">
        <div className="vp-header">
          <h1>My Products</h1>
          {!showForm && (
            <button className="btn-add" onClick={() => setShowForm(true)}>+ Add New Product</button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="vp-form-card">
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            {formError && <div className="form-error">⚠️ {formError}</div>}
            <form onSubmit={handleSubmit} className="product-form-grid">
              <div className="fg"><label>Product Name *</label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Air Max 90" required />
              </div>
              <div className="fg"><label>Brand *</label>
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. Nike" required />
              </div>
              <div className="fg"><label>Category *</label>
                <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Running" required />
              </div>
              <div className="fg"><label>Size(s) *</label>
                <input name="size" value={form.size} onChange={handleChange} placeholder="e.g. S, M, L or UK 7, 8, 9" required />
                <small style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>Separate multiple sizes with commas</small>
              </div>
              <div className="fg"><label>Gender *</label>
                <select name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option>Men</option><option>Women</option><option>Kids</option><option>Unisex</option>
                </select>
              </div>
              <div className="fg"><label>Color *</label>
                <input name="color" value={form.color} onChange={handleChange} placeholder="e.g. Black/Gum" required />
              </div>
              <div className="fg"><label>Selling Price (₹) *</label>
                <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} placeholder="e.g. 4999" required />
              </div>
              <div className="fg"><label>Original MRP (₹)</label>
                <input name="originalPrice" type="number" min="0" step="0.01" value={form.originalPrice} onChange={handleChange} placeholder="e.g. 10000" />
              </div>
              <div className="fg"><label>Stock Count</label>
                <input name="count" type="number" min="0" value={form.count} onChange={handleChange} placeholder="0" />
              </div>
              <div className="fg"><label>Main Product Image {!isEditing && '*'}</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} required={!isEditing} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="img-preview" />}
              </div>
              <div className="fg"><label>Additional Images (Max 4)</label>
                <input ref={additionalFileInputRef} type="file" accept="image/*" multiple onChange={handleAdditionalImagesChange} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {additionalImagePreviews.map((src, idx) => (
                    <img key={idx} src={src} alt="Additional Preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                  ))}
                </div>
              </div>
              <div className="fg fg-full"><label>Description *</label>
                <textarea name="desc" value={form.desc} onChange={handleChange} rows="3" placeholder="Enter product details..." required></textarea>
              </div>

              {/* Legal & More Info Section */}
              <div className="fg fg-full" style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '5px' }}>
                <h4 style={{ color: '#4b5563', marginBottom: '10px', fontSize: '1rem' }}>More Info (Legal Details)</h4>
              </div>
              <div className="fg fg-full"><label>Manufactured & Packed By</label>
                <textarea name="manufacturedBy" value={form.manufacturedBy} onChange={handleChange} rows="2" placeholder="e.g. House of CDC Fashion Pvt. Ltd..."></textarea>
              </div>
              <div className="fg"><label>Country of Origin</label>
                <input name="countryOfOrigin" value={form.countryOfOrigin} onChange={handleChange} placeholder="e.g. India" />
              </div>
              <div className="fg fg-full"><label>Consumer Complaints Contact</label>
                <textarea name="consumerComplaints" value={form.consumerComplaints} onChange={handleChange} rows="2" placeholder="e.g. Email: care@example.com, Ph: 999999999"></textarea>
              </div>

              <div className="form-actions full">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                </button>
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="empty-state">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👟</div>
            <h3>No products yet</h3>
            <p>Add your first product to start selling!</p>
            {!showForm && <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Product</button>}
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <div key={p._id} className="product-card">
                <div className="product-img-wrap">
                  <img src={`${API_BASE}/${p.image}`} alt={p.name} />
                  <span className={`status-badge ${p.status}`}>{p.status}</span>
                </div>
                <div className="product-info">
                  <h3>{p.name}</h3>
                  <p className="product-brand">{p.brand} · {p.size} · {p.color}</p>
                  <p className="product-price">
                    ₹{p.price}
                    {p.originalPrice && <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.9rem', marginLeft: '8px' }}>₹{p.originalPrice}</span>}
                  </p>
                  <p className="product-stock">Stock: {p.count} ({p.stockStatus})</p>
                </div>
                <div className="product-actions">
                  <button className="btn-edit" onClick={() => handleEdit(p)}>✏️ Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <VendorMobileNav />
    </div>
  );
};

export default VendorProducts;
