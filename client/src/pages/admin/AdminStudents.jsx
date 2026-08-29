import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminStudents.css';

export default function AdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter & Search states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [classFilter, setClassFilter] = useState(searchParams.get('classFilter') || '');
  const [medium, setMedium] = useState(searchParams.get('medium') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || '');
  const [residenceOfMP, setResidenceOfMP] = useState(searchParams.get('residenceOfMP') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [limit, setLimit] = useState(15);

  // Data states
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [exportingSelected, setExportingSelected] = useState(false);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        search: search.trim(),
        classFilter,
        medium,
        gender,
        residenceOfMP,
        dateFrom,
        dateTo,
        sortBy,
        sortOrder,
      };

      const res = await API.get('/admin/students', { params });
      if (res.data.success) {
        setStudents(res.data.students || []);
        setPagination(res.data.pagination || { total: 0, pages: 1 });
      }
    } catch (err) {
      toast.error('Failed to load student records');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, classFilter, medium, gender, residenceOfMP, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Sync URL query params
  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (classFilter) p.classFilter = classFilter;
    if (medium) p.medium = medium;
    if (gender) p.gender = gender;
    if (residenceOfMP) p.residenceOfMP = residenceOfMP;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    if (sortBy !== 'createdAt') p.sortBy = sortBy;
    if (sortOrder !== 'desc') p.sortOrder = sortOrder;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [search, classFilter, medium, gender, residenceOfMP, dateFrom, dateTo, sortBy, sortOrder, page, setSearchParams]);

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s._id));
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
  const handleDownloadSinglePdf = async (studentId, studentName, classApplied) => {
    try {
      toast.loading('Generating PDF...', { id: 'single-pdf' });
      const res = await API.get(`/admin/students/${studentId}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `BT_${safeName}_Class${classApplied}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded!', { id: 'single-pdf' });
    } catch (err) {
      toast.error('Failed to download PDF', { id: 'single-pdf' });
    }
  };

  const handleDownloadSelectedPdf = async () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    try {
      setExportingSelected(true);
      toast.loading(`Generating PDF for ${selectedIds.length} students...`, { id: 'bulk-sel-pdf' });
      const res = await API.post('/admin/bulk-pdf', { studentIds: selectedIds }, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Burhani_Tutorials_Selected_${selectedIds.length}_Students.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Selected PDF generated and downloaded!', { id: 'bulk-sel-pdf' });
    } catch (err) {
      toast.error('Failed to generate PDF for selected students', { id: 'bulk-sel-pdf' });
    } finally {
      setExportingSelected(false);
    }
  };

  const handleArchive = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive student: ${name}?`)) return;
    try {
      const res = await API.delete(`/admin/students/${id}`);
      if (res.data.success) {
        toast.success('Student archived successfully');
        fetchStudents();
      }
    } catch (err) {
      toast.error('Failed to archive student');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setClassFilter('');
    setMedium('');
    setGender('');
    setResidenceOfMP('');
    setDateFrom('');
    setDateTo('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || classFilter || medium || gender || residenceOfMP || dateFrom || dateTo;

  return (
    <AdminLayout
      title="Student Board Forms"
      subtitle={`Total ${pagination.total} student record${pagination.total === 1 ? '' : 's'} registered`}
      actions={
        <>
          {selectedIds.length > 0 && (
            <button 
              className="btn btn-accent btn-sm"
              onClick={handleDownloadSelectedPdf}
              disabled={exportingSelected}
            >
              📥 Download Selected ({selectedIds.length})
            </button>
          )}
          <button 
            className={`btn btn-sm ${hasActiveFilters ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
          >
            🔍 Filters {hasActiveFilters && '•'}
          </button>
        </>
      }
    >
      {/* Search Bar & Quick Controls */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ padding: '16px 20px' }}>
          <div className="students-search-row">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input 
                type="text"
                className="form-input search-input"
                placeholder="Search by student name, father name, phone, or application ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
              {search && (
                <button className="search-clear-btn" onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            <div className="class-pill-filters">
              {['', '9', '10', '11', '12'].map((c) => (
                <button
                  key={c || 'all'}
                  className={`class-pill ${classFilter === c ? 'active' : ''}`}
                  onClick={() => { setClassFilter(c); setPage(1); }}
                >
                  {c ? `Class ${c}th` : 'All Classes'}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filter Drawer */}
          {filterPanelOpen && (
            <div className="advanced-filter-drawer">
              <div className="filter-grid">
                <div className="form-group">
                  <label className="form-label">Medium</label>
                  <select 
                    className="form-select"
                    value={medium}
                    onChange={(e) => { setMedium(e.target.value); setPage(1); }}
                  >
                    <option value="">All Mediums</option>
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select 
                    className="form-select"
                    value={gender}
                    onChange={(e) => { setGender(e.target.value); setPage(1); }}
                  >
                    <option value="">All Genders</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">MP Resident</label>
                  <select 
                    className="form-select"
                    value={residenceOfMP}
                    onChange={(e) => { setResidenceOfMP(e.target.value); setPage(1); }}
                  >
                    <option value="">All</option>
                    <option value="Yes">Resident of MP (Yes)</option>
                    <option value="No">Outside MP (No)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sort By</label>
                  <select 
                    className="form-select"
                    value={`${sortBy}:${sortOrder}`}
                    onChange={(e) => {
                      const [sb, so] = e.target.value.split(':');
                      setSortBy(sb);
                      setSortOrder(so);
                      setPage(1);
                    }}
                  >
                    <option value="createdAt:desc">Newest First</option>
                    <option value="createdAt:asc">Oldest First</option>
                    <option value="studentName:asc">Name (A–Z)</option>
                    <option value="studentName:desc">Name (Z–A)</option>
                    <option value="applicationId:asc">Application ID</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">From Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">To Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div className="filter-drawer-footer">
                <button className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                  Clear All Filters
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setFilterPanelOpen(false)}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Student List Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="page-loading" style={{ minHeight: 300 }}>
              <div className="spinner spinner-lg" />
              <p>Fetching students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h4>No Student Records Found</h4>
              <p>Try adjusting your search query or active filters.</p>
              {hasActiveFilters && (
                <button className="btn btn-outline btn-sm" onClick={handleClearFilters} style={{ marginTop: 12 }}>
                  Reset Filters
                </button>
              )}
            </div>
          ) : (
            <div className="table-wrapper" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40, textAlign: 'center' }}>
                      <input 
                        type="checkbox"
                        aria-label="Select all students"
                        checked={students.length > 0 && selectedIds.length === students.length}
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>Application ID</th>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Father's Name</th>
                    <th>Phone</th>
                    <th>Medium</th>
                    <th>Gender</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => {
                    const isSelected = selectedIds.includes(s._id);
                    return (
                      <tr key={s._id} className={isSelected ? 'row-selected' : ''}>
                        <td style={{ textAlign: 'center' }}>
                          <input 
                            type="checkbox"
                            aria-label={`Select student ${s.studentName}`}
                            checked={isSelected}
                            onChange={() => handleSelectOne(s._id)}
                          />
                        </td>
                        <td>
                          <Link to={`/admin/students/${s._id}`} className="app-id-link">
                            {s.applicationId}
                          </Link>
                        </td>
                        <td>
                          <strong>{s.studentName}</strong>
                        </td>
                        <td>
                          <span className="badge badge-primary">
                            Class {s.classApplied}th
                          </span>
                        </td>
                        <td>{s.fatherName}</td>
                        <td>
                          <a href={`tel:${s.phone}`} style={{ color: 'var(--color-primary)' }}>
                            {s.phone}
                          </a>
                        </td>
                        <td>{s.medium}</td>
                        <td>{s.gender}</td>
                        <td>{new Date(s.createdAt).toLocaleDateString('en-IN')}</td>
                        <td>
                          <span className={`badge ${s.status === 'approved' ? 'badge-success' : s.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                            {s.status?.replace('_', ' ')?.toUpperCase() || 'SUBMITTED'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                            <Link 
                              to={`/admin/students/${s._id}`}
                              className="btn btn-outline btn-sm"
                              title="View Full Profile"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDownloadSinglePdf(s._id, s.studentName, s.classApplied)}
                              className="btn btn-accent btn-sm"
                              title="Download Standard PDF"
                            >
                              📥 PDF
                            </button>
                            <button
                              onClick={() => handleArchive(s._id, s.studentName)}
                              className="btn btn-ghost btn-sm"
                              title="Archive Student"
                              style={{ color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="table-pagination-footer">
              <div className="pagination-info">
                Showing {Math.min((page - 1) * limit + 1, pagination.total)}–
                {Math.min(page * limit, pagination.total)} of {pagination.total} students
              </div>

              <div className="pagination-buttons">
                <button
                  className="page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  aria-label="Previous page"
                >
                  ←
                </button>
                {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.pages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} style={{ display: 'flex', alignItems: 'center' }}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px' }}>…</span>}
                      <button
                        className={`page-btn ${page === p ? 'active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  className="page-btn"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage(p => Math.min(p + 1, pagination.pages))}
                  aria-label="Next page"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
