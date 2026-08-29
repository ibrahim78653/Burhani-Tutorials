import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminStudents.css';

export default function AdminAdmissions() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & Search states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [classFilter, setClassFilter] = useState(searchParams.get('classFilter') || '');
  const [branchFilter, setBranchFilter] = useState(searchParams.get('branch') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(15);

  // Data states
  const [admissions, setAdmissions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [exportingSelected, setExportingSelected] = useState(false);

  // Fetch admissions
  const fetchAdmissions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim(),
        classFilter,
        branch: branchFilter,
        status,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      };

      const res = await API.get('/admin/admissions', { params });
      if (res.data.success) {
        setAdmissions(res.data.admissions || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load admission records');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, classFilter, branchFilter, status, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchAdmissions();
  }, [fetchAdmissions]);

  // Sync URL query params
  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (classFilter) p.classFilter = classFilter;
    if (branchFilter) p.branch = branchFilter;
    if (status) p.status = status;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    if (sortBy !== 'createdAt') p.sortBy = sortBy;
    if (sortOrder !== 'desc') p.sortOrder = sortOrder;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [search, classFilter, branchFilter, status, dateFrom, dateTo, sortBy, sortOrder, page, setSearchParams]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(admissions.map(a => a._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // PDF generation
  const handleDownloadSinglePdf = async (admissionId, studentName, classApplied) => {
    try {
      toast.loading('Generating Admission PDF...', { id: 'single-adm-pdf' });
      const res = await API.get(`/admin/admissions/${admissionId}/pdf`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `Burhani_Admission_${safeName}_Class${classApplied}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Admission PDF downloaded!', { id: 'single-adm-pdf' });
    } catch (err) {
      toast.error('Failed to download Admission PDF', { id: 'single-adm-pdf' });
    }
  };

  const handleBulkPdfDownload = async () => {
    try {
      setExportingSelected(true);
      toast.loading('Generating Bulk Admission PDF...', { id: 'bulk-adm-pdf' });
      const payload = {};
      if (selectedIds.length > 0) {
        payload.admissionIds = selectedIds;
      } else {
        if (classFilter) payload.classFilter = classFilter;
        if (branchFilter) payload.branch = branchFilter;
        if (dateFrom) payload.dateFrom = dateFrom;
        if (dateTo) payload.dateTo = dateTo;
      }

      const res = await API.post('/admin/bulk-admission-pdf', payload, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const label = selectedIds.length > 0 ? `Selected_${selectedIds.length}` : (classFilter ? `Class${classFilter}` : 'All');
      link.setAttribute('download', `Burhani_Admissions_${label}_${new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Bulk Admission PDF downloaded!', { id: 'bulk-adm-pdf' });
    } catch (err) {
      toast.error('Failed to generate bulk PDF', { id: 'bulk-adm-pdf' });
    } finally {
      setExportingSelected(false);
    }
  };

  // Quick status update
  const handleStatusChange = async (admissionId, newStatus) => {
    try {
      const res = await API.patch(`/admin/admissions/${admissionId}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Status updated to ${newStatus}`);
        setAdmissions(prev => 
          prev.map(a => a._id === admissionId ? { ...a, status: newStatus } : a)
        );
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Clear filters
  const handleResetFilters = () => {
    setSearch('');
    setClassFilter('');
    setBranchFilter('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || classFilter || branchFilter || status || dateFrom || dateTo;

  return (
    <AdminLayout 
      title="Admission Applications" 
      subtitle={`Tutorial Admissions for Classes 5th through 12th (${pagination.total} Total)`}
    >
      <div className="admin-students-page">
        {/* TOP ACTION BAR */}
        <div className="table-top-actions">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by student name, father's name, phone, school, branch, or App ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="search-input"
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          <div className="action-buttons-group">
            <button
              onClick={handleBulkPdfDownload}
              className="btn btn-primary btn-sm btn-icon"
              disabled={exportingSelected || admissions.length === 0}
              title="Download Consolidated PDF"
            >
              📄 {selectedIds.length > 0 ? `Export Selected (${selectedIds.length})` : 'Export All PDF'}
            </button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="filter-card">
          <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select 
                className="form-select"
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Classes (5th–12th)</option>
                {['5', '6', '7', '8', '9', '10', '11', '12'].map(c => (
                  <option key={c} value={c}>Class {c}th</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <select 
                className="form-select"
                value={branchFilter}
                onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
              >
                <option value="">All Branches</option>
                <option value="Noorani Nagar">Noorani Nagar</option>
                <option value="Saify Nagar">Saify Nagar</option>
                <option value="Masakin-E-Saifiya">Masakin-E-Saifiya</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-select"
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date From</label>
              <input
                type="date"
                className="form-input"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date To</label>
              <input
                type="date"
                className="form-input"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              />
            </div>

            {hasActiveFilters && (
              <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={handleResetFilters}
                  className="btn btn-ghost btn-sm"
                  style={{ width: '100%' }}
                >
                  🔄 Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="table-responsive-card">
          {loading ? (
            <div className="table-loading">
              <div className="spinner spinner-md" />
              <p>Loading admission records...</p>
            </div>
          ) : admissions.length === 0 ? (
            <div className="table-empty">
              <div className="empty-icon">📝</div>
              <h3>No Admission Applications Found</h3>
              <p>
                {hasActiveFilters 
                  ? 'No admissions match your current search or filter criteria.' 
                  : 'No student admission applications have been submitted yet.'}
              </p>
              {hasActiveFilters && (
                <button onClick={handleResetFilters} className="btn btn-outline btn-sm">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input 
                      type="checkbox"
                      checked={selectedIds.length === admissions.length && admissions.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>App ID</th>
                  <th>Student Name</th>
                  <th>Branch</th>
                  <th>Class</th>
                  <th>Father's Name</th>
                  <th>Mobile Number</th>
                  <th>School Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((adm) => (
                  <tr key={adm._id} className={selectedIds.includes(adm._id) ? 'selected-row' : ''}>
                    <td>
                      <input 
                        type="checkbox"
                        checked={selectedIds.includes(adm._id)}
                        onChange={() => handleSelectOne(adm._id)}
                      />
                    </td>
                    <td>
                      <Link to={`/admin/admissions/${adm._id}`} className="app-id-link">
                        <strong>{adm.applicationId}</strong>
                      </Link>
                    </td>
                    <td>
                      <div className="student-name-cell">
                        <Link to={`/admin/admissions/${adm._id}`} className="student-title-link">
                          {adm.studentName}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline" style={{ background: '#f8fafc', color: 'var(--color-primary)', fontWeight: 600 }}>
                        📍 {adm.branch || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-class">Class {adm.classApplied}th</span>
                    </td>
                    <td>{adm.fatherName}</td>
                    <td>
                      <a href={`tel:${adm.phone}`} className="phone-link">
                        {adm.phone}
                      </a>
                    </td>
                    <td>
                      <span className="school-text">{adm.schoolName || '—'}</span>
                    </td>
                    <td>
                      <a href={`tel:${adm.phone}`} className="phone-link">
                        {adm.phone}
                      </a>
                    </td>
                    <td>
                      {new Date(adm.createdAt || adm.submittedAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <select
                        className={`status-select status-${adm.status || 'submitted'}`}
                        value={adm.status || 'submitted'}
                        onChange={(e) => handleStatusChange(adm._id, e.target.value)}
                      >
                        <option value="submitted">Submitted</option>
                        <option value="under_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="row-actions">
                        <button
                          onClick={() => handleDownloadSinglePdf(adm._id, adm.studentName, adm.classApplied)}
                          className="btn-action-icon btn-pdf"
                          title="Download Formatted PDF"
                        >
                          📄
                        </button>
                        <Link 
                          to={`/admin/admissions/${adm._id}`}
                          className="btn-action-icon btn-view"
                          title="View Full Application"
                        >
                          👁️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && pagination.pages > 1 && (
          <div className="pagination-bar">
            <div className="pagination-info">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, pagination.total)} of {pagination.total} applications
            </div>
            <div className="pagination-controls">
              <button
                className="btn btn-outline btn-sm"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(p - 1, 1))}
              >
                ← Prev
              </button>
              <span className="page-indicator">
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn btn-outline btn-sm"
                disabled={page >= pagination.pages}
                onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
