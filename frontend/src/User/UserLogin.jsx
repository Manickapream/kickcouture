import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserLogin.css';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

const UserLogin = () => {
  const navigate = useNavigate();
  const { loginUser, logoutAdmin, logoutVendor } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up State
  const [name, setName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  // Signup handler
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/user/signup", {
        name,
        email: signupEmail,
        password: signupPassword,
      });
      alert(res.data.message);
      setIsSignUp(false); // Switch to login form
    } catch (err) {
      alert(err.response?.data?.message || "Signup error");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/user/login", { email, password });
      logoutAdmin();
      logoutVendor();
      loginUser(res.data.token, res.data.user); // store JWT in context + localStorage
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login error");
    }
  };

  return (
    <div className="user-login-container">
      <form className="user-login-form" onSubmit={isSignUp ? handleSignup : handleLogin}>
        <h2>{isSignUp ? 'Sign Up' : 'User Login'}</h2>

        {isSignUp && (
          <div className="form-group">
            <label htmlFor="name">Name:</label>
            <input
              type="text"
              id="name"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Email"
            value={isSignUp ? signupEmail : email}
            onChange={(e) =>
              isSignUp ? setSignupEmail(e.target.value) : setEmail(e.target.value)
            }
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            placeholder="Password"
            value={isSignUp ? signupPassword : password}
            onChange={(e) =>
              isSignUp ? setSignupPassword(e.target.value) : setPassword(e.target.value)
            }
            required
          />
        </div>

        <button type="submit">{isSignUp ? 'Sign Up' : 'Login'}</button>

        <p className="toggle-link">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button
            type="button"
            className="switch-btn"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
};

export default UserLogin;
