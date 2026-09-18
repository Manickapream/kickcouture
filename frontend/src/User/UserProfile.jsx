import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaShoppingCart, FaBox } from 'react-icons/fa'
import './UserProfile.css'

const UserProfile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("userLoggedIn");
    if (isLoggedIn === "false" || !userEmail) {
      navigate('/UserLogin');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user");
        const users = res.data.users;
        const currentUser = users.find(u => u.email === userEmail);
        if (currentUser) {
          setUserInfo(currentUser);
        }
      } catch (err) {
        console.error("Error fetching user", err);
      }
    };
    fetchUser();
  }, [navigate, userEmail]);

  const handleLogout = () => {
    localStorage.setItem('userLoggedIn', 'false');
    localStorage.removeItem('userEmail');
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        <div className="profile-avatar">
          {userInfo ? userInfo.name.charAt(0) : "U"}
        </div>
        <h1 className="profile-name">{userInfo ? userInfo.name : "Loading..."}</h1>
        <p className="profile-email">{userInfo ? userInfo.email : ""}</p>
        
        <div className="profile-actions-grid">
          <div className="action-card" onClick={() => navigate('/cart')}>
            <div className="action-icon"><FaShoppingCart /></div>
            <h3>My Cart</h3>
            <p>View and manage items in your cart</p>
          </div>
          
          <div className="action-card" onClick={() => navigate('/old-orders')}>
            <div className="action-icon"><FaBox /></div>
            <h3>My Orders</h3>
            <p>Track, return, or buy items again</p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default UserProfile;