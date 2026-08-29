import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [recentAdmissions, setRecentAdmissions] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentFreeSessions, setRecentFreeSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportClass, setExportClass] = useState('');
  const [exportFrom, setExportFrom] = useState('');
  const [exportTo, setExportTo] = useState('');
  const [exporting, setExporting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecent(res.data.recent || []);
        setRecentAdmissions(res.data.recentAdmissions || []);
        setRecentAppointments(res.data.recentAppointments || []);
        setRecentFreeSessions(res.data.recentFreeSessions || []);
      }
    } catch (err) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBulkPdfDownload = async (e) => {
    e.preventDefault();
    try {
      setExporting(true);
      const payload = {};
      if (exportClass) payload.classFilter = exportClass;
      if (exportFrom) payload.dateFrom = exportFrom;
      if (exportTo) payload.dateTo = exportTo;

      const res = await API.post('/admin/bulk-pdf', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const classLabel = exportClass ? `Class${exportClass}` : 'AllClasses';
      link.setAttribute('download', `Burhani_Tutorials_Students_${classLabel}_${new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Bulk PDF generated & downloaded!');
      setExportModalOpen(false);
    } catch (err) {
      toast.error('Failed to generate bulk PDF. No matching records or server error.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard" subtitle="Overview of institutional enquiries, admissions and board applications">
        <div className="page-loading">
          <div className="spinner spinner-lg" />
          <p>Loading dashboard statistics...</p>
        </div>
      </AdminLayout>
    );
  }

  const totalBoard = stats?.total || 0;
  const totalAdmissions = stats?.admissionsTotal || 0;
  const totalAppointments = stats?.appointmentsTotal || 0;
  const newAppointments = stats?.appointmentsNew || 0;
  const totalFreeSessions = stats?.freeSessionsTotal || 0;
  const newFreeSessions = stats?.freeSessionsNew || 0;

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Complete overview of student inquiries, appointments, trials, and admission forms"
      actions={
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link to="/admin/appointments" className="btn btn-accent btn-sm">
            📅 Appointments ({totalAppointments})
          </Link>
          <Link to="/admin/free-sessions" className="btn btn-outline btn-sm">
            ✨ Free Trials ({totalFreeSessions})
          </Link>
          <Link to="/admin/admissions" className="btn btn-primary btn-sm">
            📝 Admissions ({totalAdmissions})
          </Link>
        </div>
      }
    >
      {/* 4 Primary Top Level KPI Cards */}
      <div className="dashboard-stats-grid">
        {/* Appointments Card */}
        <Link
          to="/admin/appointments"
          className="stat-card stat-card-highlight"
          style={{ textDecoration: 'none', borderLeft: '4px solid #c8a96e' }}
        >
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            📅
          </div>
          <div>
            <div className="stat-number">{totalAppointments}</div>
            <div className="stat-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              In-Person Appointments
            </div>
            <div style={{ fontSize: '0.75rem', color: '#b45309', fontWeight: 600, marginTop: 2 }}>
              {newAppointments} New Inquiries →
            </div>
          </div>
        </Link>

        {/* Free Sessions Card */}
        <Link
          to="/admin/free-sessions"
          className="stat-card stat-card-highlight"
          style={{ textDecoration: 'none', borderLeft: '4px solid #10b981' }}
        >
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            ✨
          </div>
          <div>
            <div className="stat-number">{totalFreeSessions}</div>
            <div className="stat-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              2-Day Free Sessions
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, marginTop: 2 }}>
              {newFreeSessions} New Trial Requests →
            </div>
          </div>
        </Link>

        {/* Admissions Card */}
        <Link
          to="/admin/admissions"
          className="stat-card stat-card-highlight"
          style={{ textDecoration: 'none', borderLeft: '4px solid #3b82f6' }}
        >
          <div className="stat-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            📝
          </div>
          <div>
            <div className="stat-number">{totalAdmissions}</div>
            <div className="stat-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Admission Forms
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Classes 5th to 12th →
            </div>
          </div>
        </Link>

        {/* Board Forms Card */}
        <Link
          to="/admin/students"
          className="stat-card stat-card-highlight"
          style={{ textDecoration: 'none', borderLeft: '4px solid #8b5cf6' }}
        >
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            🎓
          </div>
          <div>
            <div className="stat-number">{totalBoard}</div>
            <div className="stat-label" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
              Board Registrations
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Classes 9th to 12th →
            </div>
          </div>
        </Link>
      </div>

      {/* Class Level Counts Grid */}
      <div className="dashboard-stats-grid" style={{ marginTop: 16 }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
            📘
          </div>
          <div>
            <div className="stat-number">{(stats?.admClass9 || 0) + (stats?.class9 || 0)}</div>
            <div className="stat-label">Class 9th (Total)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe', color: '#7c3aed' }}>
            📗
          </div>
          <div>
            <div className="stat-number">{(stats?.admClass10 || 0) + (stats?.class10 || 0)}</div>
            <div className="stat-label">Class 10th (Total)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            📙
          </div>
          <div>
            <div className="stat-number">{(stats?.admClass11 || 0) + (stats?.class11 || 0)}</div>
            <div className="stat-label">Class 11th (Total)</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            📕
          </div>
          <div>
            <div className="stat-number">{(stats?.admClass12 || 0) + (stats?.class12 || 0)}</div>
            <div className="stat-label">Class 12th (Total)</div>
          </div>
        </div>
      </div>

      {/* RECENT APPOINTMENTS WIDGET */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <div className="table-header-flex">
            <div>
              <h3 className="dashboard-section-heading">📅 Recent Appointment Inquiries</h3>
              <p className="dashboard-section-sub">Latest parent & student consultation requests</p>
            </div>
            <Link to="/admin/appointments" className="btn btn-accent btn-sm">
              View All ({totalAppointments}) →
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h4>No Appointments Yet</h4>
              <p>Appointments booked on the website will appear here in real-time.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Appt ID</th>
                    <th>Student Name</th>
                    <th>Parent Name</th>
                    <th>Class</th>
                    <th>Branch</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments.map((appt) => (
                    <tr key={appt._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#1a3557' }}>
                          {appt.appointmentId}
                        </strong>
                      </td>
                      <td><strong>{appt.studentName}</strong></td>
                      <td>{appt.parentName}</td>
                      <td>Class {appt.classApplied}th {appt.stream ? `(${appt.stream})` : ''}</td>
                      <td>{appt.branch}</td>
                      <td><a href={`tel:${appt.phone}`} style={{ color: '#2563eb' }}>📞 {appt.phone}</a></td>
                      <td>
                        <span className={`badge ${appt.status === 'New' ? 'badge-warning' : 'badge-primary'}`}>
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RECENT 2-DAY FREE SESSIONS WIDGET */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <div className="table-header-flex">
            <div>
              <h3 className="dashboard-section-heading">✨ Recent 2-Day Free Session Registrations</h3>
              <p className="dashboard-section-sub">Complimentary trial requests from prospective families</p>
            </div>
            <Link to="/admin/free-sessions" className="btn btn-outline btn-sm">
              View All ({totalFreeSessions}) →
            </Link>
          </div>

          {recentFreeSessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h4>No Trial Requests Yet</h4>
              <p>2-day trial registrations will appear here in real-time.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Student Name</th>
                    <th>Parent Name</th>
                    <th>Class</th>
                    <th>Branch</th>
                    <th>Phone</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFreeSessions.map((sess) => (
                    <tr key={sess._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: '#c8a96e' }}>
                          {sess.requestId}
                        </strong>
                      </td>
                      <td><strong>{sess.studentName}</strong></td>
                      <td>{sess.parentName}</td>
                      <td>Class {sess.classApplied}th</td>
                      <td>{sess.branch}</td>
                      <td><a href={`tel:${sess.phone}`} style={{ color: '#2563eb' }}>📞 {sess.phone}</a></td>
                      <td>
                        <span className={`badge ${sess.status === 'New' ? 'badge-warning' : 'badge-primary'}`}>
                          {sess.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ADMISSION APPLICATIONS */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <div className="table-header-flex">
            <div>
              <h3 className="dashboard-section-heading">📝 Recent Admission Form Applications</h3>
              <p className="dashboard-section-sub">Latest tutorial admissions (Classes 5th–12th)</p>
            </div>
            <Link to="/admin/admissions" className="btn btn-accent btn-sm">
              View All Admissions ({totalAdmissions}) →
            </Link>
          </div>

          {recentAdmissions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <h4>No Admission Applications Yet</h4>
              <p>Submitted admission forms will appear here in real-time.</p>
            </div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>School Name</th>
                    <th>Submitted Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdmissions.map((adm) => (
                    <tr key={adm._id}>
                      <td>
                        <strong style={{ fontFamily: 'monospace', color: 'var(--color-accent-dark)' }}>
                          {adm.applicationId}
                        </strong>
                      </td>
                      <td><strong>{adm.studentName}</strong></td>
                      <td>
                        <span className="badge badge-primary">Class {adm.classApplied}th</span>
                      </td>
                      <td>{adm.schoolName || '—'}</td>
                      <td>{new Date(adm.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <span className={`badge ${adm.status === 'approved' ? 'badge-success' : adm.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                          {adm.status?.replace('_', ' ')?.toUpperCase() || 'SUBMITTED'}
                        </span>
                      </td>
                      <td>
                        <Link to={`/admin/admissions/${adm._id}`} className="btn btn-outline btn-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-body">
          <h3 className="dashboard-section-heading">Quick Actions</h3>
          <p className="dashboard-section-sub">Common administrative tools</p>

          <div className="quick-actions-list">
            <button 
              className="quick-action-btn"
              onClick={() => setExportModalOpen(true)}
            >
              <div className="qa-icon" style={{ background: '#fef3c7', color: '#b45309' }}>📑</div>
              <div className="qa-text">
                <div className="qa-title">Generate Standard Bulk PDF</div>
                <div className="qa-desc">Export all or class-filtered students with photo & signature</div>
              </div>
              <span className="qa-arrow">→</span>
            </button>

            <Link to="/admin/appointments" className="quick-action-btn">
              <div className="qa-icon" style={{ background: '#fef3c7', color: '#b45309' }}>📅</div>
              <div className="qa-text">
                <div className="qa-title">Manage Appointments</div>
                <div className="qa-desc">Review, filter and update in-person consultation requests</div>
              </div>
              <span className="qa-arrow">→</span>
            </Link>

            <Link to="/admin/free-sessions" className="quick-action-btn">
              <div className="qa-icon" style={{ background: '#ecfdf5', color: '#059669' }}>✨</div>
              <div className="qa-text">
                <div className="qa-title">Manage 2-Day Free Sessions</div>
                <div className="qa-desc">Track and schedule complimentary trial classes</div>
              </div>
              <span className="qa-arrow">→</span>
            </Link>

            <Link to="/admin/admissions" className="quick-action-btn">
              <div className="qa-icon" style={{ background: '#eff6ff', color: '#1d4ed8' }}>📝</div>
              <div className="qa-text">
                <div className="qa-title">Manage Admission Forms</div>
                <div className="qa-desc">View, filter, edit status and export admission applications</div>
              </div>
              <span className="qa-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="modal-backdrop" onClick={() => setExportModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <button className="modal-close-btn" onClick={() => setExportModalOpen(false)}>✕</button>
              <h3 className="modal-title">Export Bulk PDF</h3>
              <p className="modal-subtitle">Download compiled student records in printable PDF format</p>
            </div>
            <form onSubmit={handleBulkPdfDownload} style={{ padding: 24 }}>
              <div className="form-group">
                <label className="form-label">Filter by Class</label>
                <select 
                  className="form-select"
                  value={exportClass}
                  onChange={(e) => setExportClass(e.target.value)}
                >
                  <option value="">All Classes (9th–12th)</option>
                  <option value="9">Class 9th</option>
                  <option value="10">Class 10th</option>
                  <option value="11">Class 11th</option>
                  <option value="12">Class 12th</option>
                </select>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={exportFrom}
                    onChange={(e) => setExportFrom(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={exportTo}
                    onChange={(e) => setExportTo(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button 
                  type="submit" 
                  disabled={exporting}
                  className="btn btn-accent btn-block"
                >
                  {exporting ? 'Generating PDF...' : '📥 Download Bulk PDF'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
