import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ManageUsers.css";
import adminService from "../../services/adminService";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminService.getUsers();
      setUsers(res.data.users || []);
    } catch (err) { console.error("Error fetching users", err); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this user?")) {
      try { await adminService.deleteUser(id); fetchUsers(); }
      catch (err) { console.error("Error deleting user", err); }
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <Link to="/Dashboard" className="back-link">← Dashboard</Link>
          <h1>Manage Users</h1>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="empty-state"><h3>No users found</h3></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id}>
                  <td>{i + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
