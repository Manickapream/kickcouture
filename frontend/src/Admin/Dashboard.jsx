import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { FaShoppingCart, FaBox, FaStore, FaUsers, FaChartBar, FaHourglassHalf } from "react-icons/fa";
import adminService from "../services/adminService";

function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [vendorCount, setVendorCount] = useState(0);
  const [pendingVendors, setPendingVendors] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [userRes, orderRes, reportRes] = await Promise.all([
          adminService.getUserCount(),
          adminService.getOrders(),
          adminService.getReports(),
        ]);
        setUserCount(userRes.data.userCount);
        setOrderCount(orderRes.data.orders.length);
        setVendorCount(reportRes.data.approvedVendors || 0);
        setPendingVendors(reportRes.data.pendingVendors || 0);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    }
    fetchCounts();
  }, []);

  return (
    <div className="admindashboard">
      <div className="dashboard-header">
        <h2>Welcome, Admin 👋</h2>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <FaBox /> Total Orders <span>{orderCount}</span>
        </div>
        <div className="stat-card">
          <FaUsers /> Total Users <span>{userCount}</span>
        </div>
        <div className="stat-card">
          <FaStore /> Active Vendors <span>{vendorCount}</span>
        </div>
        {pendingVendors > 0 && (
          <div className="stat-card pending-badge">
            <FaHourglassHalf /> Pending Vendors <span>{pendingVendors}</span>
          </div>
        )}
        <div className="control-card">
          <Link to="/report"><FaChartBar /> Report</Link>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="control-card">
          <Link to="/manage-users"><FaUsers /> Manage Users</Link>
        </div>
        <div className="control-card">
          <Link to="/manage-products"><FaBox /> Manage Products</Link>
        </div>
        <div className="control-card">
          <Link to="/manage-orders"><FaShoppingCart /> Manage Orders</Link>
        </div>
        <div className="control-card vendor-card-link">
          <Link to="/manage-vendors">
            <FaStore /> Manage Vendors
            {pendingVendors > 0 && <span className="badge">{pendingVendors}</span>}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
