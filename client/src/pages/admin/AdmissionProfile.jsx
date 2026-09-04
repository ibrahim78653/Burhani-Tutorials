import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import './AdmissionPreview.css';

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

function isImageDoc(doc) {
  if (!doc) return false;
  if (doc.mimeType?.startsWith('image/')) return true;
  const ext = (doc.storedName || doc.originalName || '').split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function AdmissionProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [admission, setAdmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('submitted');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

  const fetchAdmission = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/admin/admissions/${id}`);
      if (res.data.success) {
        setAdmission(res.data.admission);
        setStatus(res.data.admission.status || 'submitted');
      }
    } catch (err) {
      toast.error('Failed to load admission details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmission(); }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await API.patch(`/admin/admissions/${id}`, { status: newStatus });
      if (res.data.success) {
        setStatus(newStatus);
        setAdmission(prev => ({ ...prev, status: newStatus }));
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      toast.loading('Generating Admission PDF...', { id: 'adm-pdf-btn' });
      const res = await API.get(`/admin/admissions/${id}/pdf`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (admission.studentName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `Burhani_Admission_${admission.applicationId}_${safeName}_Class${admission.classApplied}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Admission PDF downloaded!', { id: 'adm-pdf-btn' });
    } catch (err) {
      toast.error('Failed to download PDF', { id: 'adm-pdf-btn' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Archive this admission application?')) return;
    try {
      const res = await API.delete(`/admin/admissions/${id}`);
      if (res.data.success) {
        toast.success('Application archived');
        navigate('/admin/admissions');
      }
    } catch (err) {
      toast.error('Failed to archive application');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Admission Profile" subtitle="Loading...">
        <div className="page-loading">
          <div className="spinner spinner-lg" />
          <p>Loading application...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!admission) {
    return (
      <AdminLayout title="Not Found" subtitle="Application not found">
        <div className="empty-state-card">
          <h2>Application Not Found</h2>
          <Link to="/admin/admissions" className="btn btn-primary">← Back to Admissions</Link>
        </div>
      </AdminLayout>
    );
  }

  const photoDoc = admission.documents?.find(d => d.type === 'photograph');
  const aadharDoc = admission.documents?.find(d => d.type === 'aadhar');
  
  const statusColors = {
    submitted: { bg: '#fef9c3', text: '#854d0e', border: '#fde047' },
    under_review: { bg: '#dbeafe', text: '#1e293b', border: '#93c5fd' },
    approved: { bg: '#dcfce7', text: '#14532d', border: '#86efac' },
    rejected: { bg: '#fee2e2', text: '#7f1d1d', border: '#fca5a5' },
  };
  const sc = statusColors[status] || statusColors.submitted;

  return (
    <AdminLayout
      title={admission.studentName}
      subtitle={`Admission Application — Class ${admission.classApplied}th | ${admission.applicationId}`}
    >
      <div className="adm-preview-page">

        {/* TOP BAR */}
        <div className="adm-preview-topbar">
          <Link to="/admin/admissions" className="btn btn-outline btn-sm">← Back to Admissions</Link>
          <div className="adm-preview-topbar-right">
            {/* Status control */}
            <div className="adm-status-control">
              <label className="adm-status-label">Status:</label>
              <select
                className={`status-select status-${status}`}
                value={status}
                onChange={e => handleStatusUpdate(e.target.value)}
                disabled={updatingStatus}
                title="Update Application Status"
              >
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button onClick={handleDownloadPdf} className="btn btn-primary btn-sm">
              📄 Download Formatted PDF
            </button>
            <button onClick={handleDelete} className="btn btn-danger btn-sm">
              🗑️ Archive
            </button>
          </div>
        </div>

        {/* PAGE NAVIGATION INDICATOR */}
        <div className="adm-pages-nav">
          <a href="#page-1" className="adm-page-nav-link">📄 Page 1: Admission Form</a>
          <a href="#page-2" className="adm-page-nav-link">🪪 Page 2: Aadhar Card Attachment</a>
        </div>

        {/* ============================================================
            PAGE 1: ADMISSION FORM (A4 Paper Style)
        ============================================================ */}
        <div className="adm-page-card" id="page-1">
          <div className="adm-page-tag">PAGE 1 OF 2 &bull; ADMISSION APPLICATION FORM</div>
          
          <div className="adm-form-sheet">
            {/* ---- HEADER ---- */}
            <div className="adm-header">
              {/* Logo top-left */}
              <div className="adm-header-logo">
                <img src="/bt-logo.webp" alt="Burhani Tutorials" className="adm-logo-img" />
              </div>

              {/* Centre text */}
              <div className="adm-header-center">
                <h1 className="adm-institute-name">BURHANI TUTORIALS</h1>
                <p className="adm-institute-subtitle">An Institute of Science &amp; Commerce</p>
                <p className="adm-tagline">30+ Years of Academic Excellence &amp; Dedicated Mentorship</p>
                <p className="adm-contact">📞 Contact: 9827252114, 9301262721</p>
                <p className="adm-email">✉️ Email: burhanitutorials1@gmail.com</p>
                <p className="adm-address">📍 Address: 46, 47 Noorani Nagar | 101 Saify Nagar | 616 Row house Masakin-E-saifiya</p>
              </div>

              {/* Student photo top-right */}
              <div className="adm-header-photo">
                {photoDoc ? (
                  <img
                    src={getDocUrl(photoDoc.storedName)}
                    alt="Student Photograph"
                    className="adm-student-photo"
                    onClick={() => setPreviewDoc(photoDoc)}
                    title="Click to zoom photograph"
                  />
                ) : (
                  <div className="adm-photo-placeholder">
                    <span>Affix Student Photograph</span>
                  </div>
                )}
              </div>
            </div>

            {/* ---- BANNER ---- */}
            <div className="adm-banner">
              <span className="adm-banner-title">ADMISSION FORM — SESSION 2026-27</span>
              <div className="adm-banner-sub">
                <span>Application ID: <strong>{admission.applicationId}</strong></span>
                <span>•</span>
                <span>Class Applying: <strong>Class {admission.classApplied}th</strong></span>
                <span>•</span>
                <span>Date: <strong>{formatDate(admission.createdAt || admission.submittedAt)}</strong></span>
              </div>
            </div>

            {/* ---- META INFO BAR ---- */}
            <div className="adm-meta-bar">
              <div className="adm-meta-left">
                <span className="adm-meta-tag">ADMISSION BRANCH:</span>
                <strong className="adm-branch-highlight">📍 {admission.branch || '—'}</strong>
              </div>
              <div className="adm-meta-right">
                <span
                  className="adm-status-pill"
                  style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}
                >
                  {(status || 'submitted').toUpperCase()}
                </span>
                <span className="adm-submitted-time">
                  Submitted: {new Date(admission.createdAt || admission.submittedAt).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>

            {/* ---- SECTION 1: STUDENT & PARENT PARTICULARS ---- */}
            <div className="adm-section-header">
              <span className="adm-sec-num">1</span>
              <span>STUDENT &amp; PARENT PARTICULARS</span>
            </div>

            <div className="adm-vertical-table">
              <div className="adm-vrow">
                <div className="adm-vcell label">Student Full Name</div>
                <div className="adm-vcell value highlight">{admission.studentName}</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Father's Name</div>
                <div className="adm-vcell value">{admission.fatherName}</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Mother's Name</div>
                <div className="adm-vcell value">{admission.motherName}</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Class Applying For</div>
                <div className="adm-vcell value highlight">Class {admission.classApplied}th</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Date of Birth (DOB)</div>
                <div className="adm-vcell value">{admission.dob}</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Student Mobile No.</div>
                <div className="adm-vcell value">
                  <a href={`tel:${admission.phone}`} className="adm-phone-link">{admission.phone}</a>
                </div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Preferred Branch</div>
                <div className="adm-vcell value"><strong>📍 {admission.branch || '—'}</strong></div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Current / Prev. School</div>
                <div className="adm-vcell value">{admission.schoolName || '—'}</div>
              </div>
              <div className="adm-vrow">
                <div className="adm-vcell label">Residential Address</div>
                <div className="adm-vcell value">{admission.address || '—'}</div>
              </div>
            </div>

            {/* ---- SECTION 2: UNDERTAKING & DECLARATION ---- */}
            <div className="adm-section-header" style={{ marginTop: 20 }}>
              <span className="adm-sec-num">2</span>
              <span>UNDERTAKING &amp; DECLARATION</span>
            </div>

            <p className="adm-declaration-paragraph">
              I hereby solemnly declare that all the particulars and information stated above are true, complete and correct to the best of my knowledge and belief. I agree to abide by all the rules, regulations, fee schedules and discipline policies of <strong>Burhani Tutorials</strong>.
            </p>

            {/* ---- FOOTER VERIFICATION & SIGNATURE BOXES ---- */}
            <div className="adm-footer-sign-section">
              {/* Left Box: Office Verification */}
              <div className="adm-office-box">
                <div className="adm-box-header">FOR OFFICE USE ONLY</div>
                <div className="adm-office-body">
                  <div className="adm-office-line"><span>Application ID:</span> <strong>{admission.applicationId}</strong></div>
                  <div className="adm-office-sign-label">Authorized Signature:</div>
                  <div className="adm-office-sign-box"></div>
                </div>
              </div>

              {/* Right Box: Blank Physical Parent/Guardian Signature */}
              <div className="adm-parent-sign-wrap">
                <div className="adm-parent-sign-box">
                  <div className="adm-sign-dotted-area">
                    <span className="adm-sign-cross">✕</span>
                    <span className="adm-sign-prompt">Sign here &amp; submit hardcopy to Institute</span>
                  </div>
                </div>
                <div className="adm-sign-caption">
                  <strong>Parent / Guardian Signature</strong>
                  <small>(Physical signature required on form submission)</small>
                </div>
              </div>
            </div>

            {/* ---- BOTTOM SHEET FOOTER ---- */}
            <div className="adm-sheet-footer">
              Burhani Tutorials &bull; 30+ Years of Academic Excellence &bull; 46, 47 Noorani Nagar, Indore (M.P.)
            </div>
          </div>
        </div>

        {/* ============================================================
            PAGE 2: ENCLOSURE — AADHAR CARD ATTACHMENT
        ============================================================ */}
        <div className="adm-page-card" id="page-2">
          <div className="adm-page-tag">PAGE 2 OF 2 &bull; DOCUMENT ENCLOSURE: STUDENT AADHAR CARD</div>

          <div className="adm-form-sheet page-2-sheet">
            {/* Page 2 Mini Header */}
            <div className="adm-p2-header">
              <div>
                <h2 className="adm-p2-title">BURHANI TUTORIALS</h2>
                <p className="adm-p2-sub">Document Verification &bull; Session 2026-27</p>
              </div>
              <div className="adm-p2-badge-group">
                <div className="adm-p2-badge">Student: <strong>{admission.studentName}</strong></div>
                <div className="adm-p2-badge">App ID: <strong>{admission.applicationId}</strong></div>
                <div className="adm-p2-badge">Class: <strong>Class {admission.classApplied}th</strong></div>
              </div>
            </div>

            {/* Enclosure Banner */}
            <div className="adm-enclosure-banner">
              <span>ATTACHED DOCUMENT: STUDENT AADHAR CARD</span>
            </div>

            {/* Aadhar Card Display Container */}
            <div className="adm-enclosure-body">
              {aadharDoc ? (
                <div className="adm-aadhar-attachment-frame">
                  {isImageDoc(aadharDoc) ? (
                    <div className="adm-aadhar-img-container" onClick={() => setPreviewDoc(aadharDoc)}>
                      <img
                        src={getDocUrl(aadharDoc.storedName)}
                        alt="Student Aadhar Card"
                        className="adm-full-aadhar-img"
                      />
                      <div className="adm-img-zoom-overlay">
                        <span>🔍 Click to view full resolution</span>
                      </div>
                    </div>
                  ) : (
                    <div className="adm-pdf-attachment-box">
                      <div className="adm-pdf-icon">📄</div>
                      <div className="adm-pdf-info">
                        <h4>Aadhar Card (PDF Document)</h4>
                        <p>{aadharDoc.originalName || 'aadhar_card.pdf'}</p>
                      </div>
                      <div className="adm-pdf-actions">
                        <button
                          onClick={() => setPreviewDoc(aadharDoc)}
                          className="btn btn-primary btn-sm"
                        >
                          👁️ View PDF Inside Modal
                        </button>
                        <a
                          href={getDocUrl(aadharDoc.storedName, true)}
                          className="btn btn-outline btn-sm"
                        >
                          ⬇️ Download Original
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Document metadata caption */}
                  <div className="adm-doc-meta-footer">
                    <span><strong>Filename:</strong> {aadharDoc.originalName || 'Aadhar_Card'}</span>
                    <span><strong>Status:</strong> Scanned Document Attached</span>
                    <a
                      href={getDocUrl(aadharDoc.storedName, true)}
                      className="adm-download-doc-link"
                    >
                      ⬇️ Download Original File
                    </a>
                  </div>
                </div>
              ) : (
                <div className="adm-no-doc-box">
                  <div className="adm-no-doc-icon">🪪</div>
                  <h3>No Aadhar Card Uploaded</h3>
                  <p>A physical copy of the student's Aadhar card must be submitted directly to the institute office.</p>
                </div>
              )}
            </div>

            {/* Document Verification & Seal Checklist */}
            <div className="adm-doc-verify-section">
              <div className="adm-verify-checklist">
                <h4>VERIFICATION CHECKLIST (OFFICE USE)</h4>
                <div className="adm-check-grid">
                  <div className="adm-check-item">
                    <span className="adm-checkbox-square"></span>
                    <span>Aadhar Name Matches Student Name</span>
                  </div>
                  <div className="adm-check-item">
                    <span className="adm-checkbox-square"></span>
                    <span>Date of Birth Verified with Records</span>
                  </div>
                  <div className="adm-check-item">
                    <span className="adm-checkbox-square"></span>
                    <span>Father / Guardian Name Verified</span>
                  </div>
                  <div className="adm-check-item">
                    <span className="adm-checkbox-square"></span>
                    <span>Address Matches Institute Branch Jurisdiction</span>
                  </div>
                </div>
              </div>

              <div className="adm-verify-stamp-box">
                <div className="adm-stamp-box-inner">
                  <span className="adm-stamp-title">INSTITUTE VERIFICATION SEAL</span>
                  <span className="adm-stamp-sub">Burhani Tutorials Admin</span>
                  <div className="adm-stamp-line">Verified By: ____________</div>
                  <div className="adm-stamp-line">Date: ____ / ____ / 2026</div>
                </div>
              </div>
            </div>

            {/* Bottom Sheet Footer */}
            <div className="adm-sheet-footer">
              Burhani Tutorials &bull; 30+ Years of Academic Excellence &bull; 46, 47 Noorani Nagar, Indore (M.P.)
            </div>
          </div>
        </div>

        {/* ---- MODAL PREVIEW (For Full Screen Zoom) ---- */}
        {previewDoc && (
          <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
            <div className="doc-modal-card" onClick={e => e.stopPropagation()}>
              <div className="doc-modal-header">
                <h3>
                  {previewDoc.type === 'photograph' ? '📸 Student Photograph' : '🪪 Student Aadhar Card'}
                </h3>
                <button className="doc-modal-close" onClick={() => setPreviewDoc(null)}>✕</button>
              </div>
              <div className="doc-modal-body">
                {isImageDoc(previewDoc) ? (
                  <img
                    src={getDocUrl(previewDoc.storedName)}
                    alt="Preview"
                    style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain' }}
                  />
                ) : (
                  <iframe
                    src={getDocUrl(previewDoc.storedName)}
                    title="PDF Preview"
                    style={{ width: '100%', height: '72vh', border: 'none' }}
                  />
                )}
              </div>
              <div className="doc-modal-footer">
                <a
                  href={getDocUrl(previewDoc.storedName, true)}
                  className="btn btn-primary btn-sm"
                >
                  ⬇️ Download Original High-Res File
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
