import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { FaStore, FaCheck, FaTimes, FaBan, FaRedo } from 'react-icons/fa';
import './ManageVendors.css';

const statusColors = {
  pending:  { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)' },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)' },
  suspended:{ color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)' },
};

const ManageVendors = () => {
  const { logoutAdmin } = useAuth();
  const navigate = useNavigate();

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await adminService.getVendors(filterStatus || undefined);
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, [filterStatus]);

  const doAction = async (id, action, payload) => {
    setActionLoading(prev => ({ ...prev, [id]: action }));
    try {
      const fn = {
        approve: () => adminService.approveVendor(id),
        reject:  () => adminService.rejectVendor(id, payload),
        suspend: () => adminService.suspendVendor(id),
        reactivate: () => adminService.reactivateVendor(id),
      }[action];
      const res = await fn();
      alert(res.data.message);
      fetchVendors();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} vendor.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleRejectSubmit = () => {
    doAction(rejectModal, 'reject', rejectReason);
    setRejectModal(null);
    setRejectReason('');
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="mv-container">
      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Reject Vendor Application</h3>
            <p>Provide a reason for rejection (optional):</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete information, does not meet requirements..." rows="4" />
            <div className="modal-actions">
              <button className="btn-reject-confirm" onClick={handleRejectSubmit}>Confirm Rejection</button>
              <button className="btn-cancel" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="mv-header">
        <div className="mv-title">
          <Link to="/Dashboard" className="back-link">← Dashboard</Link>
          <h1>Vendor Management</h1>
          <p>Review and manage vendor applications</p>
        </div>

        <div className="mv-filter">
          <label>Filter by status:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Vendors</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Loading vendors...</div>
      ) : vendors.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><FaStore size={48} color="#a78bfa" /></div>
          <h3>No vendors found</h3>
          <p>{filterStatus ? `No ${filterStatus} vendors.` : 'No vendor applications yet.'}</p>
        </div>
      ) : (
        <div className="vendors-grid">
          {vendors.map(vendor => {
            const cfg = statusColors[vendor.status] || statusColors.pending;
            const isLoading = (action) => actionLoading[vendor._id] === action;
            return (
              <div key={vendor._id} className="vendor-card">
                <div className="vc-top">
                  <div className="vc-avatar">{vendor.businessName?.[0]?.toUpperCase()}</div>
                  <div className="vc-info">
                    <h3>{vendor.businessName}</h3>
                    <p>{vendor.ownerName}</p>
                    <span className="status-pill" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
                      {vendor.status}
                    </span>
                  </div>
                </div>

                <div className="vc-details">
                  <div className="vc-row"><span>Email</span><span>{vendor.email}</span></div>
                  <div className="vc-row"><span>Phone</span><span>{vendor.phone}</span></div>
                  <div className="vc-row"><span>Products</span><span>{vendor.productCount}</span></div>
                  <div className="vc-row"><span>Applied</span><span>{formatDate(vendor.createdAt)}</span></div>
                  {vendor.approvedAt && <div className="vc-row"><span>Approved</span><span>{formatDate(vendor.approvedAt)}</span></div>}
                  {vendor.rejectionReason && (
                    <div className="vc-row rejection">
                      <span>Reason</span><span>{vendor.rejectionReason}</span>
                    </div>
                  )}
                </div>

                <div className="vc-actions">
                  {vendor.status === 'pending' && (
                    <>
                      <button className="btn-approve" disabled={isLoading('approve')}
                        onClick={() => doAction(vendor._id, 'approve')}>
                        {isLoading('approve') ? '...' : <><FaCheck /> Approve</>}
                      </button>
                      <button className="btn-reject" onClick={() => setRejectModal(vendor._id)}>
                        <FaTimes /> Reject
                      </button>
                    </>
                  )}
                  {vendor.status === 'approved' && (
                    <button className="btn-suspend" disabled={isLoading('suspend')}
                      onClick={() => doAction(vendor._id, 'suspend')}>
                      {isLoading('suspend') ? '...' : <><FaBan /> Suspend</>}
                    </button>
                  )}
                  {(vendor.status === 'suspended' || vendor.status === 'rejected') && (
                    <button className="btn-reactivate" disabled={isLoading('reactivate')}
                      onClick={() => doAction(vendor._id, 'reactivate')}>
                      {isLoading('reactivate') ? '...' : <><FaRedo /> Reactivate</>}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManageVendors;
