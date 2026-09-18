import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Report from './Admin/Report';
import Navbar from './Navbar/Navbar';
import UserNavbar from './Navbar/UserNavbar';
import AdminNavbar from './Navbar/AdminNavbar';
import AdminLogin from './Admin/AdminLogin';
import { Hero } from './Hero/Hero';
import { Collection } from './Collection/Collection';
import Dashboard from './Admin/Dashboard';
import UserProfile from './User/UserProfile';
import UserLogin from './User/UserLogin';
import AboutUs from '../about/AboutUs';
import { Cart } from './Cart/Cart';
import { Payment } from './pages/Payment';
import Inventory from "./Admin/inventory";
import { OldOrders } from "./OldOrders/OldOrders";
import Footer from "./Footer/Footer";


// ✅ Import Product Management Components
import ManageProducts from './Admin/products/ManageProducts';

// manage users and orders components to be added later
import ManageUsers from './Admin/products/ManageUsers';
import ManageOrders from './Admin/products/ManageOrders';

const App = () => {
  // Login state persists using localStorage
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(localStorage.getItem('adminLoggedIn') === 'true');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(localStorage.getItem('userLoggedIn') === 'true');

  // Handle admin login
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('adminLoggedIn', 'true');
  };

  // Handle admin logout
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem('adminLoggedIn', 'false');
  };

  // Handle user login
  const handleUserLogin = (email) => {
    setIsUserLoggedIn(true);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', email); // Store user email for session
  };

  // Handle user logout
  const handleUserLogout = () => {
    setIsUserLoggedIn(false);
    localStorage.setItem('userLoggedIn', 'false');
    localStorage.removeItem('userEmail'); // Clear user email on logout
  };

  return (
    <Router>
      {/* Dynamic Navbar switch based on login */}
      {isUserLoggedIn ? (
        <UserNavbar onLogout={handleUserLogout} />
      ) : isAdminLoggedIn ? (
        <AdminNavbar onLogout={handleAdminLogout} />
      ) : (
        <Navbar />
      )}

      {/* Application Routes */}
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/collection" element={<Collection isLoggedIn={isUserLoggedIn} />} />
        <Route path="/shop" element={<Collection isLoggedIn={isUserLoggedIn} />} />
        <Route path="/AdminLogin" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/UserLogin" element={<UserLogin onLogin={handleUserLogin} />} />
        <Route path="/UserProfile" element={<UserProfile />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/old-orders" element={<OldOrders />} />
        <Route path="/report" element={<Report />} />

        {/* ✅ Product Management Routes */}
        <Route path="/manage-products" element={<ManageProducts />} />

        {/* ✅ Placeholder for Users & Orders (to prevent future errors) */}
        <Route path="/manage-users" element={<ManageUsers />} />
        <Route path="/manage-orders" element={<ManageOrders />} />
        <Route path="/inventory" element={<Inventory />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;
