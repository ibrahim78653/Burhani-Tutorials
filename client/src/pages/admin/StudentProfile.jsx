import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './StudentProfile.css';

// Helper to construct authenticated document URL
function getDocUrl(storedName, download = false) {
  if (!storedName) return '';
  const token = localStorage.getItem('bt_admin_token') || '';
  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/admin/documents/${storedName}`;
  const params = [];
  if (token) params.push(`token=${encodeURIComponent(token)}`);
  if (download) params.push('download=1');
  return params.length > 0 ? `${baseUrl}?${params.join('&')}` : baseUrl;
}

// Helper to check if doc is image
function isImageDoc(doc) {
  if (!doc) return false;
  if (doc.mimeType?.startsWith('image/')) return true;
  const ext = (doc.storedName || doc.originalName || '').split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
}

// Component for document thumbnail
function AdminDocThumbnail({ doc, onPreview }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isImage = isImageDoc(doc);
  const docUrl = getDocUrl(doc.storedName);

  if (!isImage) {
    return (
      <div className="doc-card-preview" onClick={() => onPreview(doc)}>
        <div className="doc-pdf-placeholder">
          <span style={{ fontSize: '2.5rem' }}>📄</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: 4 }}>PDF Document</span>
        </div>
        <div className="doc-card-overlay">
          <span>🔍 View PDF</span>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-card-preview" onClick={() => onPreview(doc)}>
      {loading && !error && (
        <div className="doc-thumbnail-loading">
          <div className="spinner spinner-sm" />
          <span>Loading...</span>
        </div>
      )}
      {error ? (
        <div className="doc-thumbnail-error">
          <span style={{ fontSize: '1.8rem' }}>⚠️</span>
          <span>Preview unavailable</span>
          <button 
            type="button" 
            className="btn btn-ghost btn-sm" 
            style={{ fontSize: '0.7rem', padding: '2px 6px', marginTop: 4 }}
            onClick={(e) => { e.stopPropagation(); setError(false); setLoading(true); }}
          >
            🔄 Retry
          </button>
        </div>
      ) : (
        <img
          src={docUrl}
          alt={doc.originalName}
          className="doc-thumbnail-img"
          style={{ display: loading ? 'none' : 'block' }}
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
        />
      )}
      <div className="doc-card-overlay">
        <span>🔍 Preview</span>
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');
  const [status, setStatus] = useState('submitted');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [modalLoading, setModalLoading] = useState(true);
  const [modalError, setModalError] = useState(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setPreviewDoc(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset modal states when preview doc changes
  useEffect(() => {
    if (previewDoc) {
      setModalLoading(true);
      setModalError(false);
    }
  }, [previewDoc]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/students/${id}`);
      if (res.data.success) {
        setStudent(res.data.student);
        setStatus(res.data.student.status || 'submitted');
      }
    } catch (err) {
      toast.error('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await API.patch(`/admin/students/${id}`, { status: newStatus });
      if (res.data.success) {
        setStatus(newStatus);
        setStudent(prev => ({ ...prev, status: newStatus }));
        toast.success(`Status updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Generating student board form PDF...', { id: 'std-pdf' });
      const res = await API.get(`/admin/students/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (student.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `BT_${safeName}_Class${student.classApplied}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Board Form PDF downloaded!', { id: 'std-pdf' });
    } catch (err) {
      toast.error('Failed to download PDF', { id: 'std-pdf' });
    }
  };

  const handleDownloadDoc = async (storedName, originalName) => {
    try {
      toast.loading(`Downloading ${originalName}...`, { id: 'doc-dl' });
      const res = await API.get(`/admin/documents/${storedName}?download=1`, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || storedName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Document downloaded!', { id: 'doc-dl' });
    } catch (err) {
      toast.error('Failed to download document', { id: 'doc-dl' });
    }
  };

  const handleArchive = async () => {
    if (!window.confirm(`Are you sure you want to archive ${student.studentName}'s record?`)) return;
    try {
      const res = await API.delete(`/admin/students/${id}`);
      if (res.data.success) {
        toast.success('Student archived');
        navigate('/admin/students');
      }
    } catch (err) {
      toast.error('Failed to archive');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Student Profile" subtitle="Loading record...">
        <div className="page-loading">
          <div className="spinner spinner-lg" />
          <p>Fetching complete student record...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!student) {
    return (
      <AdminLayout title="Student Not Found" subtitle="Record could not be retrieved">
        <div className="card">
          <div className="card-body empty-state">
            <h4>Student Record Missing</h4>
            <p>The student record you are looking for may have been archived or deleted.</p>
            <Link to="/admin/students" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
              ← Return to Student List
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Get photo & signature objects
  const photoDoc = (student.documents || []).find(d => d.type === 'photograph');
  const signatureDoc = (student.documents || []).find(d => d.type === 'signature');

  return (
    <AdminLayout
      title={student.studentName}
      subtitle={`Application ID: ${student.applicationId} • Class ${student.classApplied}th`}
      actions={
        <>
          <Link to="/admin/students" className="btn btn-outline btn-sm">
            ← Back
          </Link>
          <button 
            className="btn btn-accent btn-sm"
            onClick={handleDownloadPdf}
          >
            📥 Download PDF
          </button>
          <button 
            className="btn btn-ghost btn-sm"
            style={{ color: '#ef4444' }}
            onClick={handleArchive}
          >
            🗑️ Archive
          </button>
        </>
      }
    >
      {/* Top Banner Card with Student Quick Info */}
      <div className="card student-banner-card" style={{ marginBottom: 20 }}>
        <div className="card-body student-banner-body">
          <div className="student-banner-photo-wrap">
            {photoDoc ? (
              <img 
                src={getDocUrl(photoDoc.storedName)}
                alt={student.studentName}
                className="student-banner-photo"
                onClick={() => setPreviewDoc(photoDoc)}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                }}
              />
            ) : null}
            <div 
              className="student-banner-photo-placeholder"
              style={{ display: photoDoc ? 'none' : 'flex' }}
            >
              👤
            </div>
            <div className="student-banner-badge">Class {student.classApplied}th</div>
          </div>

          <div className="student-banner-main">
            <div className="student-banner-header">
              <div>
                <h2 className="student-banner-name">{student.studentName}</h2>
                <div className="student-banner-meta">
                  <span>Application: <strong>{student.applicationId}</strong></span>
                  <span>•</span>
                  <span>Applied on: {new Date(student.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="student-status-control">
                <label className="form-label" style={{ fontSize: 11, marginBottom: 2 }}>APPLICATION STATUS</label>
                <select 
                  className="form-select status-select"
                  value={status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  <option value="submitted">⏳ Submitted</option>
                  <option value="under_review">🔍 Under Review</option>
                  <option value="approved">✅ Approved</option>
                  <option value="rejected">❌ Rejected</option>
                </select>
              </div>
            </div>

            <div className="student-quick-pills">
              <div className="quick-pill">
                <span className="qp-label">Father:</span>
                <strong>{student.fatherName}</strong>
              </div>
              <div className="quick-pill">
                <span className="qp-label">Phone:</span>
                <a href={`tel:${student.phone}`}><strong>{student.phone}</strong></a>
              </div>
              <div className="quick-pill">
                <span className="qp-label">Medium:</span>
                <strong>{student.medium}</strong>
              </div>
              <div className="quick-pill">
                <span className="qp-label">Gender:</span>
                <strong>{student.gender}</strong>
              </div>
              <div className="quick-pill">
                <span className="qp-label">MP Resident:</span>
                <strong>{student.residenceOfMP}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="tabs" style={{ padding: '0 16px' }}>
          <button 
            className={`tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            👤 Personal Details
          </button>
          <button 
            className={`tab ${activeTab === 'address' ? 'active' : ''}`}
            onClick={() => setActiveTab('address')}
          >
            🏠 Address
          </button>
          <button 
            className={`tab ${activeTab === 'academic' ? 'active' : ''}`}
            onClick={() => setActiveTab('academic')}
          >
            🎓 Academic Details
          </button>
          <button 
            className={`tab ${activeTab === 'languages' ? 'active' : ''}`}
            onClick={() => setActiveTab('languages')}
          >
            📚 Languages & Subjects
          </button>
          {(student.classApplied === '10' || student.classApplied === '12') && (
            <button 
              className={`tab ${activeTab === 'bank' ? 'active' : ''}`}
              onClick={() => setActiveTab('bank')}
            >
              🏦 Bank Details
            </button>
          )}
          <button 
            className={`tab ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            📎 Documents ({student.documents?.length || 0})
          </button>
        </div>

        <div className="card-body">
          {/* TAB 1: PERSONAL */}
          {activeTab === 'personal' && (
            <div className="profile-tab-content">
              <table className="review-table">
                <tbody>
                  <tr><th>Student Name {['11', '12'].includes(student.classApplied) ? '(10th Marksheet)' : '(Aadhar)'}</th><td><strong>{student.studentName}</strong></td></tr>
                  <tr><th>Father's Name {['11', '12'].includes(student.classApplied) ? '(10th Marksheet)' : '(Aadhar)'}</th><td>{student.fatherName}</td></tr>
                  <tr><th>Mother's Name {['11', '12'].includes(student.classApplied) ? '(10th Marksheet)' : '(Aadhar)'}</th><td>{student.motherName}</td></tr>
                  <tr><th>Date of Birth</th><td>{student.dob}</td></tr>
                  <tr><th>Medium of Instruction</th><td>{student.medium}</td></tr>
                  <tr><th>Gender</th><td>{student.gender}</td></tr>
                  <tr><th>Mobile Phone Number</th><td><a href={`tel:${student.phone}`}>{student.phone}</a></td></tr>
                  <tr><th>SSMID (Samagra ID)</th><td><strong>{student.ssmid || '—'}</strong></td></tr>
                  <tr><th>Residence of Madhya Pradesh</th><td>{student.residenceOfMP}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: ADDRESS */}
          {activeTab === 'address' && (
            <div className="profile-tab-content">
              <table className="review-table">
                <tbody>
                  <tr><th>Address</th><td>{student.address?.addressLine || [student.address?.houseNo, student.address?.street].filter(Boolean).join(', ') || '—'}</td></tr>
                  <tr><th>City</th><td>{student.address?.city || '—'}</td></tr>
                  {student.address?.district && <tr><th>District</th><td>{student.address.district}</td></tr>}
                  <tr><th>State</th><td>{student.address?.state || 'Madhya Pradesh'}</td></tr>
                  <tr><th>PIN Code</th><td>{student.address?.pinCode || '—'}</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: ACADEMIC */}
          {activeTab === 'academic' && (
            <div className="profile-tab-content">
              {student.classApplied === '12' ? (
                <>
                  <h4 className="profile-subheading">Class 11 Details <span style={{ fontWeight: 400, fontSize: 12, color: '#888' }}>(Optional)</span></h4>
                  <table className="review-table" style={{ marginBottom: 20 }}>
                    <tbody>
                      <tr><th>Board Name</th><td>{student.class11Details?.boardName || '—'}</td></tr>
                      <tr><th>Roll Number</th><td>{student.class11Details?.rollNumber || '—'}</td></tr>
                      <tr><th>Percentage / Result</th><td>{student.class11Details?.percentage ? `${student.class11Details.percentage}%` : '—'}</td></tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <h4 className="profile-subheading">Class 8 Details</h4>
                  <table className="review-table" style={{ marginBottom: 20 }}>
                    <tbody>
                      <tr><th>Board Name</th><td>{student.class8Details?.boardName || '—'}</td></tr>
                      <tr><th>Roll Number</th><td>{student.class8Details?.rollNumber || '—'}</td></tr>
                      <tr><th>Percentage / Result</th><td>{student.class8Details?.percentage ? `${student.class8Details.percentage}%` : '—'}</td></tr>
                    </tbody>
                  </table>
                </>
              )}

              {['10', '11', '12'].includes(student.classApplied) && student.class9Details?.boardName && (
                <>
                  <h4 className="profile-subheading">Class 9 Details</h4>
                  <table className="review-table" style={{ marginBottom: 20 }}>
                    <tbody>
                      <tr><th>Board Name</th><td>{student.class9Details?.boardName || '—'}</td></tr>
                      <tr><th>Roll Number</th><td>{student.class9Details?.rollNumber || '—'}</td></tr>
                      <tr><th>Percentage / Result</th><td>{student.class9Details?.percentage ? `${student.class9Details.percentage}%` : '—'}</td></tr>
                    </tbody>
                  </table>
                </>
              )}

              {['11', '12'].includes(student.classApplied) && (
                <>
                  <h4 className="profile-subheading">Class 10 Details</h4>
                  <table className="review-table">
                    <tbody>
                      <tr><th>Board Name</th><td>{student.class10Details?.boardName || '—'}</td></tr>
                      <tr><th>Roll Number</th><td>{student.class10Details?.rollNumber || '—'}</td></tr>
                      <tr><th>Percentage / Result</th><td>{student.class10Details?.percentage ? `${student.class10Details.percentage}%` : '—'}</td></tr>
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}

          {/* TAB 4: LANGUAGES & SUBJECTS */}
          {activeTab === 'languages' && (
            <div className="profile-tab-content">
              <table className="review-table">
                <tbody>
                  <tr><th>1st Language</th><td>{student.firstLanguage || '—'}</td></tr>
                  <tr><th>2nd Language</th><td>{student.secondLanguage || '—'}</td></tr>
                  {['9', '10'].includes(student.classApplied) && (
                    <tr><th>3rd Language</th><td>{student.thirdLanguage || '—'}</td></tr>
                  )}
                  {['11', '12'].includes(student.classApplied) && (
                    <>
                      <tr><th>1st Subject (Mandatory)</th><td><strong>{student.subject1 || '—'}</strong></td></tr>
                      <tr><th>2nd Subject (Mandatory)</th><td><strong>{student.subject2 || '—'}</strong></td></tr>
                      <tr><th>3rd Subject (Mandatory)</th><td><strong>{student.subject3 || '—'}</strong></td></tr>
                      <tr><th>4th Subject (Optional)</th><td>{student.subject4 || '—'}</td></tr>
                      <tr><th>MP Board Enrolment</th><td>{student.mpBoard || '—'}</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: BANK DETAILS */}
          {activeTab === 'bank' && (student.classApplied === '10' || student.classApplied === '12') && (
            <div className="profile-tab-content">
              <div className="alert alert-info" style={{ marginBottom: 16 }}>
                <span>🔒</span> Bank account numbers are masked for data privacy.
              </div>
              <table className="review-table">
                <tbody>
                  <tr><th>Bank Account Number</th><td><code style={{ fontSize: '1rem' }}>{student.bankAccountNumber || '—'}</code></td></tr>
                  <tr><th>IFSC Code</th><td><strong>{student.ifscCode || '—'}</strong></td></tr>
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="profile-tab-content">
              <div className="docs-profile-grid">
                {(student.documents || []).map((doc) => (
                  <div key={doc.storedName} className="doc-profile-card">
                    <AdminDocThumbnail doc={doc} onPreview={setPreviewDoc} />

                    <div className="doc-card-details">
                      <div className="doc-card-type">
                        {doc.type.replace(/([A-Z])/g, ' $1').toUpperCase()}
                      </div>
                      <div className="doc-card-filename" title={doc.originalName}>
                        {doc.originalName}
                      </div>
                      <div className="doc-card-meta">
                        {(doc.size / 1024).toFixed(1)} KB • {new Date(doc.uploadedAt).toLocaleDateString('en-IN')}
                      </div>

                      <div className="doc-card-actions">
                        <button 
                          className="btn btn-outline btn-sm btn-full"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          👁️ Preview
                        </button>
                        <button 
                          className="btn btn-primary btn-sm btn-full"
                          onClick={() => handleDownloadDoc(doc.storedName, doc.originalName)}
                        >
                          📥 Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Signature Display Block */}
              {signatureDoc && (
                <div className="signature-display-box" style={{ marginTop: 24 }}>
                  <h4 className="profile-subheading">Student Signature on Record</h4>
                  <div className="signature-preview-wrap">
                    <img 
                      src={getDocUrl(signatureDoc.storedName)}
                      alt="Student Signature"
                      className="signature-preview-img"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal Preview */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="modal modal-doc-preview" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="doc-badge-pill">
                  {previewDoc.type?.replace(/([A-Z])/g, ' $1').toUpperCase()}
                </span>
                <h3 style={{ margin: 0, fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '380px' }}>
                  {previewDoc.originalName}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleDownloadDoc(previewDoc.storedName, previewDoc.originalName)}
                >
                  📥 Download
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreviewDoc(null)}>
                  ✕
                </button>
              </div>
            </div>

            <div className="modal-body">
              {isImageDoc(previewDoc) ? (
                <div className="modal-preview-img-wrap">
                  {modalLoading && !modalError && (
                    <div style={{ color: '#fff', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <div className="spinner spinner-lg" />
                      <span>Loading high-resolution image...</span>
                    </div>
                  )}
                  {modalError ? (
                    <div style={{ color: '#fff', padding: 40, textAlign: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>⚠️</span>
                      <h4>Unable to load document image</h4>
                      <button 
                        className="btn btn-accent btn-sm" 
                        style={{ marginTop: 12 }}
                        onClick={() => handleDownloadDoc(previewDoc.storedName, previewDoc.originalName)}
                      >
                        📥 Download File Directly
                      </button>
                    </div>
                  ) : (
                    <img 
                      src={getDocUrl(previewDoc.storedName)}
                      alt={previewDoc.originalName}
                      className="modal-preview-img"
                      style={{ display: modalLoading ? 'none' : 'block' }}
                      onLoad={() => setModalLoading(false)}
                      onError={() => { setModalLoading(false); setModalError(true); }}
                    />
                  )}
                </div>
              ) : (
                <div className="modal-pdf-container">
                  <iframe 
                    src={getDocUrl(previewDoc.storedName)}
                    title={previewDoc.originalName}
                    className="modal-pdf-iframe"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
