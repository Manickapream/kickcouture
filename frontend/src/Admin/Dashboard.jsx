import React from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
import { useState, useEffect } from "react";
import api from "../api/axiosConfig";
import { FaShoppingCart, FaBox } from "react-icons/fa";

function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const userRes = await api.get("/api/user/userCount");
        setUserCount(userRes.data.userCount);

        const orderRes = await api.get("/api/order/all");
        setOrderCount(orderRes.data.orders.length);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    }

    fetchCounts();
  }, []);

  return (
    <div className="page-wrapper">
      <div className="page-card">
        <div className="admindashboard">
          <div className="dashboard-header">
            <h2>Welcome Admin</h2>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <FaBox /> Total Orders <span>{orderCount}</span>
            </div>
            <div className="stat-card">
              👤 Total Users <span>{userCount}</span>
            </div>
            <div className="control-card">
              <Link to="/report"><FaShoppingCart /> Report</Link>
            </div>
          </div>

          <div className="dashboard-controls">
            <div className="control-card">
              <Link to="/manage-users">👤 Manage Users</Link>
            </div>
            <div className="control-card">
              <Link to="/manage-products">👟 Manage Products</Link>
            </div>
            <div className="control-card">
              <Link to="/manage-orders"><FaShoppingCart /> Manage Orders</Link>
            </div>
            {/* <div className="control-card">
              <Link to="/inventory">Inventory</Link>
            </div> */}


          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
