import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Report.css";

const COLORS = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

const Report = () => {
  const [period, setPeriod] = useState("week");
  const [report, setReport] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // New: Date filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/order/all");
      let allOrders = res.data.orders || [];

      // 🧮 Apply from/to date filter if both are set
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        to.setHours(23, 59, 59, 999); // include the full 'to' day

        allOrders = allOrders.filter((order) => {
          const createdAt = new Date(order.createdAt);
          return createdAt >= from && createdAt <= to;
        });
      }

      setOrders(allOrders);

      const productStats = {};
      allOrders.forEach((order) => {
        const product = order.productId;
        if (product) {
          const name = product.name || "Unknown";
          const price = product.price || 0;
          const qty = order.quantity || 1;

          if (!productStats[name]) productStats[name] = { count: 0, total: 0 };
          productStats[name].count += qty;
          productStats[name].total += qty * price;
        }
      });

      const totalOrders = allOrders.length;
      const totalRevenue = Object.values(productStats).reduce(
        (sum, p) => sum + p.total,
        0
      );

      setReport({
        period,
        totalOrders,
        totalRevenue,
        productStats,
      });
    } catch (err) {
      console.error("Error fetching report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch whenever period, fromDate, or toDate changes
  useEffect(() => {
    fetchReport();
  }, [period, fromDate, toDate]);

  const pieData =
    report &&
    Object.entries(report.productStats || {}).map(([name, stats]) => ({
      name,
      value: stats.total,
    }));

  // Function to format date (ISO to readable format)
  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="report-container">
      <h2 className="report-title">📊 Sales & Orders Report</h2>

      {/* Period Selector */}
      <div className="report-filters">
        <label>Period:</label>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>
      </div>

      {/* 🗓️ Date Range Filter */}
      <div className="filter-by-date">
        <label>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <label>To:</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="loading-text">Loading report...</p>
      ) : report ? (
        <>
          {/* Summary */}
          <div className="report-summary">
            <div className="summary-card">
              <h3>Total Orders</h3>
              <p>{report.totalOrders}</p>
            </div>
            <div className="summary-card">
              <h3>Total Revenue</h3>
              <p>₹{report.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="summary-card">
              <h3>Report Type</h3>
              <p>{report.period.toUpperCase()}</p>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="chart-section">
            <h3>🧁 Product-wise Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="value"
                  data={pieData}
                  outerRadius={120}
                  label
                  paddingAngle={4}
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#fff"
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Product Sales Table */}
          <div className="report-card">
            <h3>🛍️ Product-wise Sales</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity Sold</th>
                  <th>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(report.productStats || {}).map(
                  ([name, stats]) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{stats.count}</td>
                      <td>{stats.total.toFixed(2)}</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Orders Table */}
          <div className="report-card">
            <h3>📅 Order Details</h3>
            <table className="report-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Email</th>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.email}</td>
                    <td>{order.productId?.name || "N/A"}</td>
                    <td>{order.status}</td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default Report;
