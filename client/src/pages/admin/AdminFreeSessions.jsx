import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { BRANCHES } from '../../data/instituteData';
import { openWhatsAppChat } from '../../utils/whatsapp';
import './AdminAppointments.css'; // Shared table & filter styles

const STATUS_OPTIONS = ['New', 'Contacted', 'Scheduled', 'Completed', 'Cancelled'];

export default function AdminFreeSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedSession, setSelectedSession] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        search,
        branch: branchFilter,
        status: statusFilter,
        classFilter,
      };
      const res = await axios.get('/api/admin/free-sessions', { params });
      if (res.data.success) {
        setSessions(res.data.freeSessions);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch free sessions error:', err);
      toast.error('Failed to load free session requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [page, branchFilter, statusFilter, classFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSessions();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`/api/admin/free-sessions/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setSessions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, status: newStatus } : s))
        );
        if (selectedSession && selectedSession._id === id) {
          setSelectedSession((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      const res = await axios.patch(`/api/admin/free-sessions/${id}`, { adminNotes: editingNotes });
      if (res.data.success) {
        toast.success('Notes saved');
        setSessions((prev) =>
          prev.map((s) => (s._id === id ? { ...s, adminNotes: editingNotes } : s))
        );
        if (selectedSession && selectedSession._id === id) {
          setSelectedSession((prev) => ({ ...prev, adminNotes: editingNotes }));
        }
      }
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this trial request?')) return;
    try {
      const res = await axios.delete(`/api/admin/free-sessions/${id}`);
      if (res.data.success) {
        toast.success('Request archived');
        setSessions((prev) => prev.filter((s) => s._id !== id));
        if (selectedSession && selectedSession._id === id) setSelectedSession(null);
      }
    } catch (err) {
      toast.error('Failed to archive request');
    }
  };

  const handleOpenWhatsApp = (sess) => {
    const msg = `Hello ${sess.parentName}, greetings from Burhani Tutorials regarding your 2-Day Free Trial Session request (${sess.requestId}) for ${sess.studentName} (Class ${sess.classApplied}th) at ${sess.branch} branch.`;
    openWhatsAppChat(msg, sess.phone);
  };

  return (
    <AdminLayout
      title="2-Day Free Session Requests"
      subtitle="Track prospective students registered for complimentary classroom trials"
      actions={
        <button onClick={fetchSessions} className="btn btn-outline btn-sm">
          🔄 Refresh
        </button>
      }
    >
      {/* Search & Filters Bar */}
      <div className="admin-filter-bar">
        <form onSubmit={handleSearchSubmit} className="admin-search-form">
          <input
            type="text"
            placeholder="Search by student, parent, phone or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input search-input"
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
        </form>

        <div className="filter-selects-row">
          <select
            value={branchFilter}
            onChange={(e) => {
              setBranchFilter(e.target.value);
              setPage(1);
            }}
            className="form-select filter-select"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b.branchKey} value={b.branchKey}>
                {b.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="form-select filter-select"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1);
            }}
            className="form-select filter-select"
          >
            <option value="">All Classes</option>
            {['5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
              <option key={c} value={c}>
                Class {c}th
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Free Sessions Content Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="table-loading-state">
            <div className="spinner" />
            <p>Loading trial requests...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="table-empty-state">
            <span className="empty-icon">✨</span>
            <h3>No Free Session Requests</h3>
            <p>No 2-day free session trial requests matched your active filters.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Student & Parent</th>
                <th>Class</th>
                <th>Branch</th>
                <th>Contact</th>
                <th>Requested On</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((sess) => (
                <tr key={sess._id} className={selectedSession?._id === sess._id ? 'selected-row' : ''}>
                  <td>
                    <span className="appt-id-badge" style={{ borderColor: '#c8a96e', color: '#0f2238' }}>
                      {sess.requestId}
                    </span>
                  </td>
                  <td>
                    <div className="cell-strong">{sess.studentName}</div>
                    <div className="cell-sub">Parent: {sess.parentName}</div>
                  </td>
                  <td>
                    <span className="class-badge">Class {sess.classApplied}th</span>
                  </td>
                  <td>
                    <span className="branch-tag">{sess.branch}</span>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <a href={`tel:${sess.phone}`} className="phone-link">
                        📞 {sess.phone}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="cell-date">
                      {new Date(sess.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="cell-time">
                      {new Date(sess.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td>
                    <select
                      value={sess.status}
                      onChange={(e) => handleStatusChange(sess._id, e.target.value)}
                      className={`status-select status-${sess.status.toLowerCase()}`}
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="btn-icon"
                        title="Quick WhatsApp"
                        onClick={() => handleOpenWhatsApp(sess)}
                      >
                        💬
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Details"
                        onClick={() => {
                          setSelectedSession(sess);
                          setEditingNotes(sess.adminNotes || '');
                        }}
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-danger-icon"
                        title="Archive"
                        onClick={() => handleDelete(sess._id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Bar */}
      {pagination.pages > 1 && (
        <div className="admin-pagination">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="btn btn-outline btn-sm"
          >
            ← Previous
          </button>
          <span>
            Page {page} of {pagination.pages} ({pagination.total} total)
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(page + 1)}
            className="btn btn-outline btn-sm"
          >
            Next →
          </button>
        </div>
      )}

      {/* Detail & Notes Slideout Modal */}
      {selectedSession && (
        <div className="details-drawer-backdrop" onClick={() => setSelectedSession(null)}>
          <div className="details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header" style={{ background: '#162a45' }}>
              <div>
                <h3>Free Trial Request Details</h3>
                <span className="appt-id-badge">{selectedSession.requestId}</span>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedSession(null)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="detail-item">
                <label>Student Name:</label>
                <strong>{selectedSession.studentName}</strong>
              </div>
              <div className="detail-item">
                <label>Parent / Guardian:</label>
                <strong>{selectedSession.parentName}</strong>
              </div>
              <div className="detail-item">
                <label>Class for Trial:</label>
                <strong>Class {selectedSession.classApplied}th</strong>
              </div>
              <div className="detail-item">
                <label>Branch Requested:</label>
                <strong>{selectedSession.branch}</strong>
              </div>
              <div className="detail-item">
                <label>Mobile Number:</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <strong>+91 {selectedSession.phone}</strong>
                  <a href={`tel:${selectedSession.phone}`} className="btn btn-outline btn-sm">
                    📞 Call
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(selectedSession)}
                    className="btn btn-accent btn-sm"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>

              {selectedSession.notes && (
                <div className="detail-item">
                  <label>Student Subject Preferences / Notes:</label>
                  <p className="query-box">{selectedSession.notes}</p>
                </div>
              )}

              <div className="detail-item">
                <label>Status:</label>
                <select
                  value={selectedSession.status}
                  onChange={(e) => handleStatusChange(selectedSession._id, e.target.value)}
                  className={`status-select status-${selectedSession.status.toLowerCase()}`}
                  style={{ marginTop: 6 }}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="detail-item notes-section">
                <label>Admin Trial Notes & Scheduling:</label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record trial batch timings, student attendance, or parent feedback..."
                  className="form-textarea"
                />
                <button
                  type="button"
                  onClick={() => handleSaveNotes(selectedSession._id)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 8 }}
                >
                  💾 Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
