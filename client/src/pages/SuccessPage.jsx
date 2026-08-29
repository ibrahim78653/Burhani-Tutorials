import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../utils/api';
import toast from 'react-hot-toast';
import './SuccessPage.css';
import './admin/AdmissionPreview.css';

// Helper for document URLs
function getDocUrl(storedName, download = false) {
  if (!storedName) return '';
  const baseUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/documents/${storedName}`;
  return download ? `${baseUrl}?download=1` : baseUrl;
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

export default function SuccessPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get('id') || searchParams.get('appId');
  const appIdFromState = state?.applicationId;
  const dbIdFromState = state?.id || state?._id;

  const targetId = dbIdFromState || queryId || appIdFromState;
  const isAdmission = state?.formType === 'admission' || (targetId && targetId.startsWith('ADM-')) || (state?.applicationId && state.applicationId.startsWith('ADM-'));

  const [record, setRecord] = useState(state?.admission || state?.student || null);
  const [loading, setLoading] = useState(!record);
  const [activeBoardTab, setActiveBoardTab] = useState('personal');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!targetId && !record) {
      navigate('/');
      return;
    }

    if (!record && targetId) {
      const fetchRecord = async () => {
        try {
          setLoading(true);
          const endpoint = isAdmission ? `/admissions/${targetId}` : `/students/${targetId}`;
          const res = await API.get(endpoint);
          if (res.data.success) {
            setRecord(isAdmission ? res.data.admission : res.data.student);
          }
        } catch (err) {
          console.error('Fetch record error:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRecord();
    }
  }, [targetId, record, isAdmission, navigate]);

  const handleDownloadPdf = async () => {
    const idToUse = record?._id || record?.applicationId || targetId;
    if (!idToUse) return;

    try {
      setDownloading(true);
      toast.loading('Generating your official form PDF...', { id: 'std-pdf-dl' });
      const endpoint = isAdmission ? `/admissions/${idToUse}/pdf` : `/students/${idToUse}/pdf`;
      const res = await API.get(endpoint, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = ((record?.studentName || state?.studentName) || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = isAdmission 
        ? `Burhani_Admission_${record?.applicationId || state?.applicationId}_${safeName}_Class${record?.classApplied || state?.classApplied}.pdf`
        : `BT_BoardForm_${record?.applicationId || state?.applicationId}_${safeName}_Class${record?.classApplied || state?.classApplied}.pdf`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Form PDF downloaded successfully!', { id: 'std-pdf-dl' });
    } catch (err) {
      console.error('PDF download error:', err);
      toast.error('Failed to download PDF. Please try again.', { id: 'std-pdf-dl' });
    } finally {
      setDownloading(false);
    }
  };

  const applicationId = record?.applicationId || state?.applicationId;
  const studentName = record?.studentName || state?.studentName;
  const classApplied = record?.classApplied || state?.classApplied;
  const submittedDate = formatDate(record?.createdAt || record?.submittedAt || state?.submittedAt || Date.now());

  const photoDoc = (record?.documents || []).find(d => d.type === 'photograph');
  const aadharDoc = (record?.documents || []).find(d => d.type === 'aadhar');

  return (
    <div className="success-preview-page">
      <Navbar />

      {/* TOP CONFIRMATION BANNER */}
      <div className="success-top-hero">
        <div className="container">
          <div className="success-hero-content">
            <div className="success-check-badge">✓</div>
            <div className="success-hero-text">
              <span className="success-pill">APPLICATION SUBMITTED SUCCESSFULLY</span>
              <h1>{isAdmission ? 'Tutorial Admission Form Submitted' : 'State Board Examination Form Submitted'}</h1>
              <p>Your application has been received by Burhani Tutorials. You can preview and download your official formatted copy below.</p>
            </div>
          </div>

          <div className="success-action-bar">
            <div className="app-id-pill">
              <span className="id-label">Application ID:</span>
              <strong className="id-val">{applicationId}</strong>
            </div>

            <div className="success-buttons">
              <button 
                onClick={handleDownloadPdf} 
                className="btn btn-accent btn-lg success-dl-btn"
                disabled={downloading}
              >
                📄 {downloading ? 'Preparing PDF...' : 'Download Form PDF'}
              </button>

              <button 
                onClick={() => window.print()} 
                className="btn btn-outline btn-lg print-btn"
              >
                🖨️ Print Form
              </button>

              <Link to="/" className="btn btn-secondary btn-lg">
                🏠 Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* INSTRUCTIONS NOTICE */}
      <div className="container" style={{ marginTop: 20 }}>
        <div className="notice-instruction-box">
          <div className="notice-icon">ℹ️</div>
          <div className="notice-text">
            <strong>Next Steps:</strong> Please download and print a copy of your completed form. Submit the printed copy along with your parent/guardian physical signature and necessary document copies to the institute office.
          </div>
        </div>
      </div>

      {/* PREVIEW CONTAINER */}
      <div className="container success-preview-container">
        <div className="preview-heading-row">
          <h2 className="preview-section-title">
            <span>👁️</span> {isAdmission ? 'Admission Form Preview' : 'Board Form Preview'}
          </h2>
          <div className="preview-status-tag">
            <span className="status-dot"></span> Status: Submitted &bull; Under Review
          </div>
        </div>

        {loading && (
          <div className="preview-loading-card">
            <div className="spinner spinner-lg"></div>
            <p>Loading your form preview...</p>
          </div>
        )}

        {/* ============================================================
            CASE 1: ADMISSION FORM PREVIEW (Page 1 + Page 2)
        ============================================================ */}
        {!loading && isAdmission && record && (
          <div className="adm-preview-page student-view">
            {/* Page 1: Admission Form Sheet */}
            <div className="adm-page-card" id="page-1">
              <div className="adm-page-tag">PAGE 1 OF 2 &bull; ADMISSION APPLICATION FORM</div>
              
              <div className="adm-form-sheet">
                {/* Header */}
                <div className="adm-header">
                  <div className="adm-header-logo">
                    <img src="/bt-logo.jpeg" alt="Burhani Tutorials" className="adm-logo-img" />
                  </div>

                  <div className="adm-header-center">
                    <h1 className="adm-institute-name">BURHANI TUTORIALS</h1>
                    <p className="adm-institute-subtitle">An Institute of Science &amp; Commerce</p>
                    <p className="adm-tagline">30+ Years of Academic Excellence &amp; Dedicated Mentorship</p>
                    <p className="adm-contact">📞 Contact: 9827252114, 9301262721</p>
                    <p className="adm-email">✉️ Email: burhanitutorials1@gmail.com</p>
                    <p className="adm-address">📍 Address: 46, 47 Noorani Nagar | 101 Saify Nagar | 616 Row house Masakin-E-saifiya</p>
                  </div>

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

                {/* Banner */}
                <div className="adm-banner">
                  <span className="adm-banner-title">ADMISSION FORM — SESSION 2026-27</span>
                  <div className="adm-banner-sub">
                    <span>Application ID: <strong>{record.applicationId}</strong></span>
                    <span>•</span>
                    <span>Class Applying: <strong>Class {record.classApplied}th</strong></span>
                    <span>•</span>
                    <span>Date: <strong>{submittedDate}</strong></span>
                  </div>
                </div>

                {/* Meta Bar */}
                <div className="adm-meta-bar">
                  <div className="adm-meta-left">
                    <span className="adm-meta-tag">ADMISSION BRANCH:</span>
                    <strong className="adm-branch-highlight">📍 {record.branch || '—'}</strong>
                  </div>
                  <div className="adm-meta-right">
                    <span className="adm-status-pill" style={{ background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' }}>
                      SUBMITTED
                    </span>
                    <span className="adm-submitted-time">
                      Submitted on {submittedDate}
                    </span>
                  </div>
                </div>

                {/* Section 1: Particulars (Vertical Table) */}
                <div className="adm-section-header">
                  <span className="adm-sec-num">1</span>
                  <span>STUDENT &amp; PARENT PARTICULARS</span>
                </div>

                <div className="adm-vertical-table">
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Student Full Name</div>
                    <div className="adm-vcell value highlight">{record.studentName}</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Father's Name</div>
                    <div className="adm-vcell value">{record.fatherName}</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Mother's Name</div>
                    <div className="adm-vcell value">{record.motherName}</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Class Applying For</div>
                    <div className="adm-vcell value highlight">Class {record.classApplied}th</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Date of Birth (DOB)</div>
                    <div className="adm-vcell value">{record.dob}</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Student Mobile No.</div>
                    <div className="adm-vcell value">
                      <a href={`tel:${record.phone}`} className="adm-phone-link">{record.phone}</a>
                    </div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Preferred Branch</div>
                    <div className="adm-vcell value"><strong>📍 {record.branch || '—'}</strong></div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Current / Prev. School</div>
                    <div className="adm-vcell value">{record.schoolName || '—'}</div>
                  </div>
                  <div className="adm-vrow">
                    <div className="adm-vcell label">Residential Address</div>
                    <div className="adm-vcell value">{record.address || '—'}</div>
                  </div>
                </div>

                {/* Section 2: Undertaking */}
                <div className="adm-section-header" style={{ marginTop: 20 }}>
                  <span className="adm-sec-num">2</span>
                  <span>UNDERTAKING &amp; DECLARATION</span>
                </div>

                <p className="adm-declaration-paragraph">
                  I hereby solemnly declare that all the particulars and information stated above are true, complete and correct to the best of my knowledge and belief. I agree to abide by all the rules, regulations, fee schedules and discipline policies of <strong>Burhani Tutorials</strong>.
                </p>

                {/* Footer Boxes */}
                <div className="adm-footer-sign-section">
                  {/* Left: Office Use Box */}
                  <div className="adm-office-box">
                    <div className="adm-box-header">FOR OFFICE USE ONLY</div>
                    <div className="adm-office-body">
                      <div className="adm-office-line"><span>Application ID:</span> <strong>{record.applicationId}</strong></div>
                      <div className="adm-office-sign-label">Authorized Signature:</div>
                      <div className="adm-office-sign-box"></div>
                    </div>
                  </div>

                  {/* Right: Parent Signature Blank Box */}
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

                {/* Sheet Footer */}
                <div className="adm-sheet-footer">
                  Burhani Tutorials &bull; 30+ Years of Academic Excellence &bull; 46, 47 Noorani Nagar, Indore (M.P.)
                </div>
              </div>
            </div>

            {/* Page 2: Enclosure - Aadhar Card */}
            <div className="adm-page-card" id="page-2">
              <div className="adm-page-tag">PAGE 2 OF 2 &bull; DOCUMENT ENCLOSURE: STUDENT AADHAR CARD</div>

              <div className="adm-form-sheet page-2-sheet">
                <div className="adm-p2-header">
                  <div>
                    <h2 className="adm-p2-title">BURHANI TUTORIALS</h2>
                    <p className="adm-p2-sub">Document Verification &bull; Session 2026-27</p>
                  </div>
                  <div className="adm-p2-badge-group">
                    <div className="adm-p2-badge">Student: <strong>{record.studentName}</strong></div>
                    <div className="adm-p2-badge">App ID: <strong>{record.applicationId}</strong></div>
                    <div className="adm-p2-badge">Class: <strong>Class {record.classApplied}th</strong></div>
                  </div>
                </div>

                <div className="adm-enclosure-banner">
                  <span>ATTACHED DOCUMENT: STUDENT AADHAR CARD</span>
                </div>

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
                      <p>Please submit a physical copy of your Aadhar card to the institute office.</p>
                    </div>
                  )}
                </div>

                {/* Verification Checklist */}
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

                <div className="adm-sheet-footer">
                  Burhani Tutorials &bull; 30+ Years of Academic Excellence &bull; 46, 47 Noorani Nagar, Indore (M.P.)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            CASE 2: BOARD FORM PREVIEW (Matching Student Profile View)
        ============================================================ */}
        {!loading && !isAdmission && record && (
          <div className="board-preview-wrap">
            {/* Hero Card */}
            <div className="card board-hero-card" style={{ marginBottom: 20 }}>
              <div className="card-body board-hero-body">
                <div className="board-photo-wrap">
                  {photoDoc ? (
                    <img 
                      src={getDocUrl(photoDoc.storedName)}
                      alt={record.studentName}
                      className="board-avatar-img"
                      onClick={() => setPreviewDoc(photoDoc)}
                    />
                  ) : (
                    <div className="board-photo-placeholder">👤</div>
                  )}
                  <div className="board-class-badge">Class {record.classApplied}th Board Form</div>
                </div>

                <div className="board-hero-info">
                  <div className="board-hero-header">
                    <div>
                      <h2 className="board-student-name">{record.studentName}</h2>
                      <div className="board-meta-row">
                        <span>Application ID: <strong>{record.applicationId}</strong></span>
                        <span>&bull;</span>
                        <span>Submission Date: {submittedDate}</span>
                      </div>
                    </div>

                    <div className="board-status-badge-wrap">
                      <span className="badge badge-warning">SUBMITTED &bull; UNDER REVIEW</span>
                    </div>
                  </div>

                  <div className="board-quick-grid">
                    <div><strong>Father's Name:</strong> {record.fatherName}</div>
                    <div><strong>Mother's Name:</strong> {record.motherName}</div>
                    <div><strong>Mobile:</strong> <a href={`tel:${record.phone}`}>{record.phone}</a></div>
                    <div><strong>DOB:</strong> {record.dob}</div>
                    <div><strong>Medium:</strong> {record.medium}</div>
                    <div><strong>Gender:</strong> {record.gender}</div>
                    <div><strong>MP Resident:</strong> {record.residenceOfMP}</div>
                    <div><strong>SSMID:</strong> {record.ssmid || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabbed Content Card */}
            <div className="card">
              <div className="tabs" style={{ padding: '0 16px', borderBottom: '1px solid #e2e8f0' }}>
                <button 
                  className={`tab ${activeBoardTab === 'personal' ? 'active' : ''}`}
                  onClick={() => setActiveBoardTab('personal')}
                >
                  👤 Personal Details
                </button>
                <button 
                  className={`tab ${activeBoardTab === 'address' ? 'active' : ''}`}
                  onClick={() => setActiveBoardTab('address')}
                >
                  🏠 Address
                </button>
                <button 
                  className={`tab ${activeBoardTab === 'academic' ? 'active' : ''}`}
                  onClick={() => setActiveBoardTab('academic')}
                >
                  🎓 Academic Details
                </button>
                <button 
                  className={`tab ${activeBoardTab === 'languages' ? 'active' : ''}`}
                  onClick={() => setActiveBoardTab('languages')}
                >
                  📚 Languages &amp; Subjects
                </button>
                {(record.classApplied === '10' || record.classApplied === '12') && (
                  <button 
                    className={`tab ${activeBoardTab === 'bank' ? 'active' : ''}`}
                    onClick={() => setActiveBoardTab('bank')}
                  >
                    🏦 Bank Details
                  </button>
                )}
                <button 
                  className={`tab ${activeBoardTab === 'documents' ? 'active' : ''}`}
                  onClick={() => setActiveBoardTab('documents')}
                >
                  📎 Uploaded Documents ({record.documents?.length || 0})
                </button>
              </div>

              <div className="card-body">
                {/* TAB 1: PERSONAL */}
                {activeBoardTab === 'personal' && (
                  <div className="profile-tab-content">
                    <table className="review-table">
                      <tbody>
                        <tr><th>Student Full Name</th><td><strong>{record.studentName}</strong></td></tr>
                        <tr><th>Father's Name</th><td>{record.fatherName}</td></tr>
                        <tr><th>Mother's Name</th><td>{record.motherName}</td></tr>
                        <tr><th>Date of Birth (DOB)</th><td>{record.dob}</td></tr>
                        <tr><th>Medium of Instruction</th><td>{record.medium}</td></tr>
                        <tr><th>Gender</th><td>{record.gender}</td></tr>
                        <tr><th>Mobile Number</th><td><a href={`tel:${record.phone}`}>{record.phone}</a></td></tr>
                        <tr><th>SSMID (Samagra ID)</th><td><strong>{record.ssmid || '—'}</strong></td></tr>
                        <tr><th>Resident of MP</th><td>{record.residenceOfMP}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 2: ADDRESS */}
                {activeBoardTab === 'address' && (
                  <div className="profile-tab-content">
                    <table className="review-table">
                      <tbody>
                        <tr><th>Address</th><td>{record.address?.addressLine || [record.address?.houseNo, record.address?.street].filter(Boolean).join(', ') || '—'}</td></tr>
                        <tr><th>City</th><td>{record.address?.city || '—'}</td></tr>
                        {record.address?.district && <tr><th>District</th><td>{record.address.district}</td></tr>}
                        <tr><th>State</th><td>{record.address?.state || 'Madhya Pradesh'}</td></tr>
                        <tr><th>PIN Code</th><td>{record.address?.pinCode || '—'}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 3: ACADEMIC */}
                {activeBoardTab === 'academic' && (
                  <div className="profile-tab-content">
                    {record.classApplied === '12' ? (
                      <>
                        <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e3a5f' }}>Class 11 Details (Optional)</h4>
                        <table className="review-table" style={{ marginBottom: 20 }}>
                          <tbody>
                            <tr><th>Board Name</th><td>{record.class11Details?.boardName || '—'}</td></tr>
                            <tr><th>Roll Number</th><td>{record.class11Details?.rollNumber || '—'}</td></tr>
                            <tr><th>Percentage / Result</th><td>{record.class11Details?.percentage ? `${record.class11Details.percentage}%` : '—'}</td></tr>
                          </tbody>
                        </table>
                      </>
                    ) : (
                      <>
                        <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e3a5f' }}>Class 8 Details</h4>
                        <table className="review-table" style={{ marginBottom: 20 }}>
                          <tbody>
                            <tr><th>Board Name</th><td>{record.class8Details?.boardName || '—'}</td></tr>
                            <tr><th>Roll Number</th><td>{record.class8Details?.rollNumber || '—'}</td></tr>
                            <tr><th>Percentage / Result</th><td>{record.class8Details?.percentage ? `${record.class8Details.percentage}%` : '—'}</td></tr>
                          </tbody>
                        </table>
                      </>
                    )}

                    {['10', '11', '12'].includes(record.classApplied) && record.class9Details?.boardName && (
                      <>
                        <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e3a5f' }}>Class 9 Details</h4>
                        <table className="review-table" style={{ marginBottom: 20 }}>
                          <tbody>
                            <tr><th>Board Name</th><td>{record.class9Details?.boardName || '—'}</td></tr>
                            <tr><th>Roll Number</th><td>{record.class9Details?.rollNumber || '—'}</td></tr>
                            <tr><th>Percentage / Result</th><td>{record.class9Details?.percentage ? `${record.class9Details.percentage}%` : '—'}</td></tr>
                          </tbody>
                        </table>
                      </>
                    )}

                    {['11', '12'].includes(record.classApplied) && record.class10Details?.boardName && (
                      <>
                        <h4 style={{ margin: '0 0 10px', fontSize: 13, color: '#1e3a5f' }}>Class 10 Details</h4>
                        <table className="review-table" style={{ marginBottom: 20 }}>
                          <tbody>
                            <tr><th>Board Name</th><td>{record.class10Details?.boardName || '—'}</td></tr>
                            <tr><th>Roll Number</th><td>{record.class10Details?.rollNumber || '—'}</td></tr>
                            <tr><th>Percentage / Result</th><td>{record.class10Details?.percentage ? `${record.class10Details.percentage}%` : '—'}</td></tr>
                          </tbody>
                        </table>
                      </>
                    )}
                  </div>
                )}

                {/* TAB 4: LANGUAGES & SUBJECTS */}
                {activeBoardTab === 'languages' && (
                  <div className="profile-tab-content">
                    <table className="review-table">
                      <tbody>
                        <tr><th>First Language (Special)</th><td>{record.firstLanguage || '—'}</td></tr>
                        <tr><th>Second Language (General)</th><td>{record.secondLanguage || '—'}</td></tr>
                        {['9', '10'].includes(record.classApplied) && (
                          <tr><th>Third Language</th><td>{record.thirdLanguage || '—'}</td></tr>
                        )}
                        {['11', '12'].includes(record.classApplied) && (
                          <>
                            <tr><th>Subject 1</th><td>{record.subject1 || '—'}</td></tr>
                            <tr><th>Subject 2</th><td>{record.subject2 || '—'}</td></tr>
                            <tr><th>Subject 3</th><td>{record.subject3 || '—'}</td></tr>
                            {record.subject4 && <tr><th>Additional Subject (4)</th><td>{record.subject4}</td></tr>}
                            <tr><th>Enrolled in MP Board</th><td>{record.mpBoard || '—'}</td></tr>
                          </>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 5: BANK DETAILS */}
                {activeBoardTab === 'bank' && (record.classApplied === '10' || record.classApplied === '12') && (
                  <div className="profile-tab-content">
                    <table className="review-table">
                      <tbody>
                        <tr><th>Bank Account Number</th><td>{record.bankAccountNumber ? '••••••••' + record.bankAccountNumber.slice(-4) : '—'}</td></tr>
                        <tr><th>Bank IFSC Code</th><td>{record.ifscCode || '—'}</td></tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 6: DOCUMENTS */}
                {activeBoardTab === 'documents' && (
                  <div className="profile-tab-content">
                    <div className="student-docs-grid">
                      {(record.documents || []).map((doc, idx) => (
                        <div key={idx} className="student-doc-card" onClick={() => setPreviewDoc(doc)}>
                          <div className="student-doc-header">
                            <span className="doc-icon">📎</span>
                            <strong className="doc-type-title">{doc.type.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</strong>
                          </div>
                          <div className="student-doc-thumb-wrap">
                            {isImageDoc(doc) ? (
                              <img src={getDocUrl(doc.storedName)} alt={doc.originalName} className="student-doc-thumb" />
                            ) : (
                              <div className="student-pdf-thumb">📄 PDF Document</div>
                            )}
                          </div>
                          <div className="student-doc-footer">
                            <span className="doc-filename">{doc.originalName || doc.storedName}</span>
                            <a href={getDocUrl(doc.storedName, true)} className="btn btn-outline btn-sm" onClick={e => e.stopPropagation()}>
                              ⬇️ Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL PREVIEW FOR DOCUMENTS */}
      {previewDoc && (
        <div className="doc-modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div className="doc-modal-card" onClick={e => e.stopPropagation()}>
            <div className="doc-modal-header">
              <h3>
                {previewDoc.type === 'photograph' ? '📸 Student Photograph' : previewDoc.type === 'aadhar' ? '🪪 Student Aadhar Card' : `📄 ${previewDoc.type}`}
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
                ⬇️ Download Original File
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
