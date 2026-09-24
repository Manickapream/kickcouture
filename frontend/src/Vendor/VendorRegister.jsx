import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import vendorService from '../services/vendorService';
import { FaCheckCircle, FaRocket, FaPercent, FaChartLine, FaStore, FaEye, FaEyeSlash } from 'react-icons/fa';
import './VendorRegister.css';

const VendorRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [form, setForm] = useState({
    ownerName: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    businessDescription: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validate = () => {
    if (!form.ownerName || !form.businessName || !form.email || !form.phone || !form.address || !form.password)
      return 'Please fill in all required fields.';
    if (form.password !== form.confirmPassword)
      return 'Passwords do not match.';
    if (form.password.length < 6)
      return 'Password must be at least 6 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      await vendorService.register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="vendor-register-container">
        <div className="vendor-register-card">
          <div className="register-left-panel">
            <div className="panel-logo">Kick<span>Couture</span></div>
            <div className="panel-tagline">Seller Partner Program</div>
            <div className="panel-title">Grow your business with us</div>
          </div>
          <div className="register-right-panel">
            <div className="success-state">
              <div className="success-icon"><FaCheckCircle color="#22c55e" /></div>
              <h2>Application Submitted!</h2>
              <p>Your vendor application has been received and is <strong>pending admin approval</strong>.</p>
              <p>You will be able to log in once an admin approves your application.</p>
              <div className="success-actions">
                <Link to="/vendor-login" className="btn-primary">Go to Vendor Login</Link>
                <Link to="/" className="btn-secondary">Back to Home</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-register-container">
      <div className="vendor-register-card">

        {/* ── LEFT BRANDING PANEL ── */}
        <div className="register-left-panel">
          <div className="panel-logo">Kick<span>Couture</span></div>
          <div className="panel-tagline">Seller Partner Program</div>
          <div className="panel-title">Start Selling Today</div>
          <div className="panel-desc">
            Join thousands of vendors already growing their business on KickCouture marketplace.
          </div>
          <div className="panel-perks">
            <div className="panel-perk"><FaRocket className="perk-icon" /> Fast Onboarding</div>
            <div className="panel-perk"><FaPercent className="perk-icon" /> Low Commission</div>
            <div className="panel-perk"><FaChartLine className="perk-icon" /> Analytics Dashboard</div>
            <div className="panel-perk"><FaStore className="perk-icon" /> Your Own Storefront</div>
          </div>
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="register-right-panel">
          <div className="register-header">
            <h2>Vendor Registration</h2>
            <p>Apply to become a seller on KickCouture marketplace</p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Owner Name <span className="req">*</span></label>
                <input name="ownerName" type="text" value={form.ownerName} onChange={handleChange}
                  placeholder="Your full name" required />
              </div>

              <div className="form-group">
                <label>Business Name <span className="req">*</span></label>
                <input name="businessName" type="text" value={form.businessName} onChange={handleChange}
                  placeholder="Your shop/brand name" required />
              </div>

              <div className="form-group">
                <label>Email Address <span className="req">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange}
                  placeholder="business@email.com" required />
              </div>

              <div className="form-group">
                <label>Phone Number <span className="req">*</span></label>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="10-digit phone number" required />
              </div>

              <div className="form-group full-width">
                <label>Business Address <span className="req">*</span></label>
                <textarea name="address" value={form.address} onChange={handleChange}
                  placeholder="Full business address" rows="2" required />
              </div>

              <div className="form-group full-width">
                <label>Business Description <span className="optional">(optional)</span></label>
                <textarea name="businessDescription" value={form.businessDescription} onChange={handleChange}
                  placeholder="Tell us about your business..." rows="3" />
              </div>

              <div className="form-group">
                <label>Password <span className="req">*</span></label>
                <div className="input-wrapper">
                  <input name="password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    placeholder="Min. 6 characters" required />
                  <button type="button" className="eye-btn" onClick={() => setShowPassword(p => !p)} tabIndex={-1}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Confirm Password <span className="req">*</span></label>
                <div className="input-wrapper">
                  <input name="confirmPassword" type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword} onChange={handleChange}
                    placeholder="Re-enter password" required />
                  <button type="button" className="eye-btn" onClick={() => setShowConfirm(p => !p)} tabIndex={-1}>
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Submitting Application...' : 'Submit Vendor Application'}
            </button>
          </form>

          <div className="register-footer">
            <p>Already applied? <Link to="/vendor-login">Vendor Login →</Link></p>
            <p>Looking to shop? <Link to="/UserLogin">Customer Login →</Link></p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VendorRegister;
