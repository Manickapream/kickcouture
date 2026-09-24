import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  const [userToken, setUserToken]   = useState(() => localStorage.getItem('userToken'));
  const [vendorToken, setVendorToken] = useState(() => localStorage.getItem('vendorToken'));

  const [adminData, setAdminData]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminData')); } catch { return null; }
  });
  const [userData, setUserData]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('userData')); } catch { return null; }
  });
  const [vendorData, setVendorData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vendorData')); } catch { return null; }
  });

  // ─── Admin ────────────────────────────────────────────────────────────────
  const loginAdmin = useCallback((token, data) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminData', JSON.stringify(data));
    localStorage.setItem('adminLoggedIn', 'true');
    setAdminToken(token);
    setAdminData(data);
  }, []);

  const logoutAdmin = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    localStorage.setItem('adminLoggedIn', 'false');
    setAdminToken(null);
    setAdminData(null);
  }, []);

  // ─── User ─────────────────────────────────────────────────────────────────
  const loginUser = useCallback((token, data) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(data));
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userEmail', data.email); // backward compat
    setUserToken(token);
    setUserData(data);
  }, []);

  const logoutUser = useCallback(() => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    localStorage.setItem('userLoggedIn', 'false');
    localStorage.removeItem('userEmail');
    setUserToken(null);
    setUserData(null);
  }, []);

  // ─── Vendor ───────────────────────────────────────────────────────────────
  const loginVendor = useCallback((token, data) => {
    localStorage.setItem('vendorToken', token);
    localStorage.setItem('vendorData', JSON.stringify(data));
    localStorage.setItem('vendorLoggedIn', 'true');
    setVendorToken(token);
    setVendorData(data);
  }, []);

  const logoutVendor = useCallback(() => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorData');
    localStorage.setItem('vendorLoggedIn', 'false');
    setVendorToken(null);
    setVendorData(null);
  }, []);

  // ─── Computed state ───────────────────────────────────────────────────────
  const isAdminLoggedIn  = !!adminToken;
  const isUserLoggedIn   = !!userToken;
  const isVendorLoggedIn = !!vendorToken;

  return (
    <AuthContext.Provider value={{
      // Admin
      adminToken, adminData, isAdminLoggedIn, loginAdmin, logoutAdmin,
      // User
      userToken, userData, isUserLoggedIn, loginUser, logoutUser,
      // Vendor
      vendorToken, vendorData, isVendorLoggedIn, loginVendor, logoutVendor,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
