import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import axios from 'axios';

const AdminLogin = ({ onAdminLogin }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });

      alert(res.data.message);
      onAdminLogin(); // Notify App of admin login

      navigate('/Dashboard'); // Redirect to dashboard
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Admin Login</h2>

        <div className="form-group">
          <label htmlFor="adminEmail">Email:</label>
          <input
            type="email"
            id="adminEmail"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminPassword">Password:</label>
          <input
            type="password"
            id="adminPassword"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;
