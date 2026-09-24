import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import vendorService from '../services/vendorService';
import { FaUserCircle, FaEnvelope, FaPhoneAlt, FaStore, FaMapMarkerAlt, FaCalendarAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import VendorMobileNav from './VendorMobileNav';
import './VendorProfile.css';

const statusConfig = {
  approved: { color: '#16a34a', label: '✅ Approved Vendor', bg: '#f0fdf4', border: '#bbf7d0' },
  pending:  { color: '#d97706', label: '⏳ Pending Approval', bg: '#fffbeb', border: '#fde68a' },
  rejected: { color: '#dc2626', label: '❌ Application Rejected', bg: '#fef2f2', border: '#fecaca' },
  suspended:{ color: '#ea580c', label: '🚫 Account Suspended', bg: '#fff7ed', border: '#fed7aa' },
};

const VendorProfile = () => {
  const { vendorData, logoutVendor } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    ownerName: '',
    phone: '',
    address: '',
    businessDescription: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = () => {
    vendorService.getProfile()
      .then(res => {
        setProfile(res.data.vendor);
        setEditForm({
          ownerName: res.data.vendor.ownerName || '',
          phone: res.data.vendor.phone || '',
          address: res.data.vendor.address || '',
          businessDescription: res.data.vendor.businessDescription || ''
        });
      })
      .catch(err => console.error('Profile error:', err))
      .finally(() => setLoading(false));
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await vendorService.updateProfile(editForm);
      setProfile(res.data.vendor);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const vendor = profile || vendorData;
  const cfg = statusConfig[vendor?.status] || statusConfig.pending;

  return (
    <div className="vprof-container">
      <div className="vprof-sidebar">
        <div className="sidebar-brand"><h2><span className="accent">Kick</span>Couture</h2><p>Vendor Portal</p></div>
        <nav className="sidebar-nav">
          <Link to="/vendor-dashboard" className="nav-item">🏠 Dashboard</Link>
          <Link to="/vendor-products" className="nav-item">👟 My Products</Link>
          <Link to="/vendor-orders" className="nav-item">📦 My Orders</Link>
          <Link to="/vendor-profile" className="nav-item active">👤 Profile</Link>
        </nav>
        <button className="logout-btn" onClick={() => { logoutVendor(); navigate('/vendor-login'); }}>← Logout</button>
      </div>

      <div className="vprof-main">
        <div className="vp-header-flex">
          <h1>My Profile</h1>
          <div className="header-actions">
            {!isEditing ? (
              <button className="vp-edit-btn" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="vp-edit-actions">
                <button className="vp-cancel-btn" onClick={() => setIsEditing(false)} disabled={isSaving}>
                  <FaTimes /> Cancel
                </button>
                <button className="vp-save-btn" onClick={handleSaveProfile} disabled={isSaving}>
                  <FaSave /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
            <div className="status-chip" style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
              {cfg.label}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading profile details...</div>
        ) : !vendor ? (
          <div className="error-state">Failed to load profile.</div>
        ) : (
          <div className="profile-wrapper">
            {/* Top Banner / Avatar Card */}
            <div className="profile-banner-card">
              <div className="banner-bg"></div>
              <div className="banner-content">
                <div className="avatar-circle">
                  {vendor.businessName?.[0]?.toUpperCase() || 'V'}
                </div>
                <div className="banner-info">
                  <h2>{vendor.businessName}</h2>
                  {isEditing ? (
                    <input 
                      type="text" 
                      name="ownerName" 
                      value={editForm.ownerName} 
                      onChange={handleEditChange} 
                      className="vp-edit-input" 
                      placeholder="Owner Name"
                    />
                  ) : (
                    <p className="owner-name"><FaUserCircle /> {vendor.ownerName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="details-grid">
              {/* Contact Info */}
              <div className="detail-card">
                <h3>Contact Information</h3>
                <div className="detail-item">
                  <div className="detail-icon"><FaEnvelope /></div>
                  <div className="detail-text">
                    <span className="label">Email Address (Non-editable)</span>
                    <span className="value">{vendor.email}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon"><FaPhoneAlt /></div>
                  <div className="detail-text">
                    <span className="label">Phone Number</span>
                    {isEditing ? (
                      <input type="tel" name="phone" value={editForm.phone} onChange={handleEditChange} className="vp-edit-input" />
                    ) : (
                      <span className="value">{vendor.phone}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="detail-card">
                <h3>Business Details</h3>
                <div className="detail-item">
                  <div className="detail-icon"><FaStore /></div>
                  <div className="detail-text">
                    <span className="label">Store Name (Non-editable)</span>
                    <span className="value">{vendor.businessName}</span>
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-icon"><FaMapMarkerAlt /></div>
                  <div className="detail-text">
                    <span className="label">Store Address</span>
                    {isEditing ? (
                      <input type="text" name="address" value={editForm.address} onChange={handleEditChange} className="vp-edit-input" />
                    ) : (
                      <span className="value">{vendor.address}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* About & Timeline */}
              <div className="detail-card full-width">
                <div className="flex-split">
                  <div className="about-section">
                    <h3>About Your Business</h3>
                    {isEditing ? (
                      <textarea 
                        name="businessDescription" 
                        value={editForm.businessDescription} 
                        onChange={handleEditChange} 
                        className="vp-edit-textarea"
                        placeholder="Describe your business..."
                      />
                    ) : (
                      <p className="desc-text">{vendor.businessDescription || "No description provided."}</p>
                    )}
                  </div>
                  <div className="timeline-section">
                    <h3>Account Timeline</h3>
                    <div className="timeline-item">
                      <FaCalendarAlt className="t-icon" />
                      <span><strong>Applied:</strong> {new Date(vendor.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    {vendor.approvedAt && (
                      <div className="timeline-item success">
                        <FaCalendarAlt className="t-icon" />
                        <span><strong>Approved:</strong> {new Date(vendor.approvedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {vendor.status === 'rejected' && vendor.rejectionReason && (
                <div className="detail-card alert-card full-width">
                  <h3>⚠️ Rejection Reason</h3>
                  <p>{vendor.rejectionReason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <VendorMobileNav />
    </div>
  );
};

export default VendorProfile;
