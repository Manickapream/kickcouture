import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import ScrollToTop from './components/ScrollToTop';

// Navbars
import Navbar from './Navbar/Navbar';
import UserNavbar from './Navbar/UserNavbar';
import AdminNavbar from './Navbar/AdminNavbar';

// Public / Customer Pages
import { Hero } from './Hero/Hero';
import { Collection } from './Collection/Collection';
import UserLogin from './User/UserLogin';
import UserProfile from './User/UserProfile';
import AboutUs from '../about/AboutUs';
import { Cart } from './Cart/Cart';
import { Payment } from './pages/Payment';
import { OldOrders } from './OldOrders/OldOrders';
import Footer from './Footer/Footer';
import SingleProduct from './Product/SingleProduct';

import Wishlist from './Wishlist/Wishlist';

// Admin Pages
import AdminLogin from './Admin/AdminLogin';
import Dashboard from './Admin/Dashboard';
import ManageProducts from './Admin/products/ManageProducts';
import ManageUsers from './Admin/products/ManageUsers';
import ManageOrders from './Admin/products/ManageOrders';
import ManageVendors from './Admin/ManageVendors';
import Inventory from './Admin/inventory';
import Report from './Admin/Report';
import AdminSidebar from './Admin/AdminSidebar';

// Vendor Pages
import VendorRegister from './Vendor/VendorRegister';
import VendorLogin from './Vendor/VendorLogin';
import VendorDashboard from './Vendor/VendorDashboard';
import VendorProducts from './Vendor/VendorProducts';
import VendorOrders from './Vendor/VendorOrders';
import VendorProfile from './Vendor/VendorProfile';

const AppNavbar = () => {
  const { isUserLoggedIn, logoutUser } = useAuth();
  const location = useLocation();
  const path = location.pathname;

  const isVendorRoute = path.startsWith('/vendor-');
  const isAdminRoute = [
    '/Dashboard',
    '/manage-products',
    '/manage-users',
    '/manage-orders',
    '/manage-vendors',
    '/report',
    '/inventory',
  ].some(r => path.startsWith(r));

  if (isVendorRoute || isAdminRoute) return null;

  if (isUserLoggedIn) return <UserNavbar onLogout={logoutUser} />;
  return <Navbar />;
};

/* Wraps every admin page with the sidebar */
const AdminLayout = ({ children }) => (
  <div className="admin-layout">
    <AdminSidebar />
    <main className="admin-main">{children}</main>
  </div>
);

const AppFooter = () => {
  const { isAdminLoggedIn, isVendorLoggedIn } = useAuth();
  const location = useLocation();
  const isVendorPage = location.pathname.startsWith('/vendor-');
  const isAdminPage = [
    '/Dashboard',
    '/manage-products',
    '/manage-users',
    '/manage-orders',
    '/manage-vendors',
    '/report',
    '/inventory',
  ].some(r => location.pathname.startsWith(r));
  if (isAdminLoggedIn || isVendorLoggedIn || isVendorPage || isAdminPage) return null;
  return <Footer />;
};

const App = () => {
  const { isUserLoggedIn, isAdminLoggedIn, isVendorLoggedIn } = useAuth();

  return (
    <Router>
      <ScrollToTop />
      <AppNavbar />

      <Routes>
        {/* ─── Public Routes ────────────────────────────────────── */}
        <Route path="/" element={<Hero />} />
        <Route path="/collection" element={<Collection isLoggedIn={isUserLoggedIn} />} />
        <Route path="/shop" element={<Collection isLoggedIn={isUserLoggedIn} />} />
        <Route path="/product/:id" element={<SingleProduct />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/old-orders" element={<OldOrders />} />

        {/* ─── User Auth ────────────────────────────────────────── */}
        <Route path="/UserLogin" element={<UserLogin />} />
        <Route path="/UserProfile" element={<UserProfile />} />

        {/* ─── Admin Auth ───────────────────────────────────────── */}
        <Route path="/AdminLogin" element={<AdminLogin />} />

        {/* ─── Admin Protected Routes ───────────────────────────── */}
        <Route path="/Dashboard" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><Dashboard /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/manage-products" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><ManageProducts /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/manage-users" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><ManageUsers /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/manage-orders" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><ManageOrders /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/manage-vendors" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><ManageVendors /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/report" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><Report /></AdminLayout>
          </RoleProtectedRoute>
        } />
        <Route path="/inventory" element={
          <RoleProtectedRoute role="admin" redirectTo="/AdminLogin">
            <AdminLayout><Inventory /></AdminLayout>
          </RoleProtectedRoute>
        } />

        {/* ─── Vendor Routes ────────────────────────────────────── */}
        <Route path="/vendor-register" element={<VendorRegister />} />
        <Route path="/vendor-login" element={<VendorLogin />} />
        <Route path="/vendor-dashboard" element={
          <RoleProtectedRoute role="vendor" redirectTo="/vendor-login">
            <VendorDashboard />
          </RoleProtectedRoute>
        } />
        <Route path="/vendor-products" element={
          <RoleProtectedRoute role="vendor" redirectTo="/vendor-login">
            <VendorProducts />
          </RoleProtectedRoute>
        } />
        <Route path="/vendor-orders" element={
          <RoleProtectedRoute role="vendor" redirectTo="/vendor-login">
            <VendorOrders />
          </RoleProtectedRoute>
        } />
        <Route path="/vendor-profile" element={
          <RoleProtectedRoute role="vendor" redirectTo="/vendor-login">
            <VendorProfile />
          </RoleProtectedRoute>
        } />
      </Routes>

      {/* Only show footer on non-vendor, non-admin pages */}
      <AppFooter />
    </Router>
  );
};

export default App;
