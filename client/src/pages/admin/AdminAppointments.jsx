import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/admin/AdminLayout';
import { BRANCHES } from '../../data/instituteData';
import { openWhatsAppChat } from '../../utils/whatsapp';
import './AdminAppointments.css';

const STATUS_OPTIONS = ['New', 'Contacted', 'Scheduled', 'Completed', 'Cancelled'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');

  const fetchAppointments = async () => {
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
      const res = await axios.get('/api/admin/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Fetch appointments error:', err);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [page, branchFilter, statusFilter, classFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.patch(`/api/admin/appointments/${id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, status: newStatus } : a))
        );
        if (selectedAppt && selectedAppt._id === id) {
          setSelectedAppt((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNotes = async (id) => {
    try {
      const res = await axios.patch(`/api/admin/appointments/${id}`, { adminNotes: editingNotes });
      if (res.data.success) {
        toast.success('Notes saved');
        setAppointments((prev) =>
          prev.map((a) => (a._id === id ? { ...a, adminNotes: editingNotes } : a))
        );
        if (selectedAppt && selectedAppt._id === id) {
          setSelectedAppt((prev) => ({ ...prev, adminNotes: editingNotes }));
        }
      }
    } catch (err) {
      toast.error('Failed to save notes');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this appointment?')) return;
    try {
      const res = await axios.delete(`/api/admin/appointments/${id}`);
      if (res.data.success) {
        toast.success('Appointment archived');
        setAppointments((prev) => prev.filter((a) => a._id !== id));
        if (selectedAppt && selectedAppt._id === id) setSelectedAppt(null);
      }
    } catch (err) {
      toast.error('Failed to archive appointment');
    }
  };

  const handleOpenWhatsApp = (appt) => {
    const msg = `Hello ${appt.parentName}, greeting from Burhani Tutorials regarding appointment (${appt.appointmentId}) for ${appt.studentName} for Class ${appt.classApplied}th at ${appt.branch} branch.`;
    openWhatsAppChat(msg, appt.phone);
  };

  return (
    <AdminLayout
      title="Appointment Logs"
      subtitle="Manage in-person consultation and visit bookings across all 3 branches"
      actions={
        <button onClick={fetchAppointments} className="btn btn-outline btn-sm">
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

      {/* Appointments Content Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="table-loading-state">
            <div className="spinner" />
            <p>Loading appointments...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="table-empty-state">
            <span className="empty-icon">📅</span>
            <h3>No Appointments Found</h3>
            <p>No appointment bookings matched your active search or filter criteria.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Appt ID</th>
                <th>Student & Parent</th>
                <th>Class & Stream</th>
                <th>Branch</th>
                <th>Contact</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appt) => (
                <tr key={appt._id} className={selectedAppt?._id === appt._id ? 'selected-row' : ''}>
                  <td>
                    <span className="appt-id-badge">{appt.appointmentId}</span>
                  </td>
                  <td>
                    <div className="cell-strong">{appt.studentName}</div>
                    <div className="cell-sub">Parent: {appt.parentName}</div>
                  </td>
                  <td>
                    <span className="class-badge">Class {appt.classApplied}th</span>
                    {appt.stream && <span className="stream-badge-inline">{appt.stream}</span>}
                  </td>
                  <td>
                    <span className="branch-tag">{appt.branch}</span>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <a href={`tel:${appt.phone}`} className="phone-link">
                        📞 {appt.phone}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="cell-date">
                      {new Date(appt.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="cell-time">
                      {new Date(appt.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </td>
                  <td>
                    <select
                      value={appt.status}
                      onChange={(e) => handleStatusChange(appt._id, e.target.value)}
                      className={`status-select status-${appt.status.toLowerCase()}`}
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
                        title="Quick WhatsApp Chat"
                        onClick={() => handleOpenWhatsApp(appt)}
                      >
                        💬
                      </button>
                      <button
                        type="button"
                        className="btn-icon"
                        title="View Details & Notes"
                        onClick={() => {
                          setSelectedAppt(appt);
                          setEditingNotes(appt.adminNotes || '');
                        }}
                      >
                        👁️
                      </button>
                      <button
                        type="button"
                        className="btn-icon btn-danger-icon"
                        title="Archive"
                        onClick={() => handleDelete(appt._id)}
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
      {selectedAppt && (
        <div className="details-drawer-backdrop" onClick={() => setSelectedAppt(null)}>
          <div className="details-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <h3>Appointment Details</h3>
                <span className="appt-id-badge">{selectedAppt.appointmentId}</span>
              </div>
              <button className="drawer-close-btn" onClick={() => setSelectedAppt(null)}>
                ✕
              </button>
            </div>

            <div className="drawer-body">
              <div className="detail-item">
                <label>Student Name:</label>
                <strong>{selectedAppt.studentName}</strong>
              </div>
              <div className="detail-item">
                <label>Parent / Guardian:</label>
                <strong>{selectedAppt.parentName}</strong>
              </div>
              <div className="detail-item">
                <label>Class & Stream:</label>
                <strong>
                  Class {selectedAppt.classApplied}th {selectedAppt.stream ? `(${selectedAppt.stream})` : ''}
                </strong>
              </div>
              <div className="detail-item">
                <label>Selected Branch:</label>
                <strong>{selectedAppt.branch}</strong>
              </div>
              <div className="detail-item">
                <label>Phone Number:</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 4 }}>
                  <strong>+91 {selectedAppt.phone}</strong>
                  <a href={`tel:${selectedAppt.phone}`} className="btn btn-outline btn-sm">
                    📞 Call
                  </a>
                  <button
                    type="button"
                    onClick={() => handleOpenWhatsApp(selectedAppt)}
                    className="btn btn-accent btn-sm"
                  >
                    💬 WhatsApp
                  </button>
                </div>
              </div>

              {selectedAppt.preferredDate && (
                <div className="detail-item">
                  <label>Preferred Visit Date:</label>
                  <strong>{selectedAppt.preferredDate}</strong>
                </div>
              )}

              {selectedAppt.message && (
                <div className="detail-item">
                  <label>Student's Special Query:</label>
                  <p className="query-box">{selectedAppt.message}</p>
                </div>
              )}

              <div className="detail-item">
                <label>Status:</label>
                <select
                  value={selectedAppt.status}
                  onChange={(e) => handleStatusChange(selectedAppt._id, e.target.value)}
                  className={`status-select status-${selectedAppt.status.toLowerCase()}`}
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
                <label>Admin Follow-up Notes:</label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="Record call summary, scheduled date/time, or guardian discussion..."
                  className="form-textarea"
                />
                <button
                  type="button"
                  onClick={() => handleSaveNotes(selectedAppt._id)}
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
