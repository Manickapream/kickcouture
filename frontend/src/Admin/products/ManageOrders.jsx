import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ManageOrders.css";
import adminService from "../../services/adminService";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminService.getOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Error fetching orders", err);
    } finally { setLoading(false); }
  };

  const handleDelete = async (order) => {
    if (order.status === "approved") { alert("Approved orders cannot be deleted!"); return; }
    try { await adminService.deleteOrder(order._id); fetchOrders(); }
    catch (err) { console.error("Error removing order", err); }
  };

  const handleApprove = async (order) => {
    try {
      const res = await adminService.approveOrder(order._id);
      alert(res.data.message || "Order approved!");
      fetchOrders();
    } catch (err) { alert(err.response?.data?.message || "Failed to approve order!"); }
  };

  const statusClass = (s) => {
    const map = { cart: "status-cart", approved: "status-approved", delivered: "status-delivered", pending: "status-pending" };
    return map[s] || "";
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/Dashboard" className="back-link">← Dashboard</Link>
          <h1>Manage Orders</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state"><h3>No orders found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Name</th>
                <th>Recipient</th>
                <th>Size</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const p = order.productId;
                return (
                  <tr key={order._id}>
                    <td><img className="product-thumb" src={`${API_BASE}/${p?.image}`} alt={p?.name} /></td>
                    <td>{p?.name}</td>
                    <td>{order.email}</td>
                    <td>{p?.size}</td>
                    <td>&#8377;{p?.price}</td>
                    <td><span className={`status-badge ${statusClass(order.status)}`}>{order.status}</span></td>
                    <td style={{ display: "flex", gap: "8px" }}>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(order)}>Cancel</button>
                      <button className="btn-action btn-edit"
                        onClick={() => handleApprove(order)}
                        disabled={order.status === "approved"}
                      >
                        {order.status === "approved" ? "Approved" : "Approve"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageOrders;
