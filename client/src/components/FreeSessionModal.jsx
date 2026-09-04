import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BRANCHES } from '../data/instituteData';
import { formatWhatsAppFreeSessionMessage, openWhatsAppChat } from '../utils/whatsapp';
import './FreeSessionModal.css';

export default function FreeSessionModal({ isOpen, onClose, initialBranch = '', initialClass = '' }) {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    classApplied: initialClass || '10',
    phone: '',
    branch: initialBranch || 'Noorani Nagar',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [whatsappInfo, setWhatsappInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({
        ...prev,
        branch: initialBranch || prev.branch || 'Noorani Nagar',
        classApplied: initialClass || prev.classApplied || '10',
      }));
      setSubmittedData(null);
      setWhatsappInfo(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialBranch, initialClass]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentName.trim()) {
      toast.error('Please enter the Student Name');
      return;
    }
    if (!formData.parentName.trim()) {
      toast.error('Please enter the Parent Name');
      return;
    }
    const cleanPhone = formData.phone.trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!formData.branch) {
      toast.error('Please select a branch');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/free-sessions', {
        ...formData,
        phone: cleanPhone,
      });

      if (response.data.success) {
        setSubmittedData(response.data.request);
        setWhatsappInfo(response.data.whatsapp);
        toast.success('2-Day Free Session requested successfully!');

        // Automatically open WhatsApp chat in new window
        if (response.data.whatsapp?.message) {
          openWhatsAppChat(response.data.whatsapp.message);
        }
      }
    } catch (err) {
      console.error('Free session error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit free session request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualWhatsApp = () => {
    if (whatsappInfo?.message) {
      openWhatsAppChat(whatsappInfo.message);
    } else if (submittedData) {
      const msg = formatWhatsAppFreeSessionMessage(submittedData);
      openWhatsAppChat(msg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="free-session-title">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header free-session-header">
          <div className="modal-brand-badge free-session-badge">
            <span className="modal-brand-dot free-session-dot" />
            Complimentary Academic Trial
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
          <h2 id="free-session-title" className="modal-title">
            {submittedData ? 'Free Session Registered!' : 'Claim Your 2-Day Complimentary Session'}
          </h2>
          <p className="modal-subtitle">
            {submittedData
              ? 'Your trial session request has been registered in our database.'
              : 'Experience the Burhani Tutorials learning environment with 2 days of real classroom teaching.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {submittedData ? (
            <div className="modal-success-card">
              <div className="success-icon-wrap free-session-success-icon">
                <span className="success-checkmark">★</span>
              </div>
              <h3 className="success-heading">Welcome to Burhani Tutorials!</h3>
              <p className="success-sub">
                Your 2-Day Free Session request has been received. Our coordinator will contact you to schedule your preferred trial dates.
              </p>

              <div className="success-id-box">
                <span className="success-id-label">Request ID:</span>
                <span className="success-id-val">{submittedData.requestId}</span>
              </div>

              <div className="success-details-list">
                <div className="success-row">
                  <span>Student Name:</span>
                  <strong>{submittedData.studentName}</strong>
                </div>
                <div className="success-row">
                  <span>Parent Name:</span>
                  <strong>{submittedData.parentName}</strong>
                </div>
                <div className="success-row">
                  <span>Class:</span>
                  <strong>Class {submittedData.classApplied}th</strong>
                </div>
                <div className="success-row">
                  <span>Branch:</span>
                  <strong>{submittedData.branch}</strong>
                </div>
                <div className="success-row">
                  <span>Mobile Phone:</span>
                  <strong>+91 {submittedData.phone}</strong>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn btn-whatsapp btn-lg btn-block"
                  onClick={handleManualWhatsApp}
                >
                  💬 Open WhatsApp Notification
                </button>
                <button
                  type="button"
                  className="btn btn-outline btn-block"
                  onClick={onClose}
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="free-session-form" noValidate>
              <div className="free-session-highlight-box">
                <span className="highlight-tag">✨ ZERO RISK TRIAL</span>
                <p>Attend 2 full days of regular classes, meet faculty, and experience our teaching firsthand before taking admission.</p>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="fs-studentName" className="form-label required">
                    Student Full Name
                  </label>
                  <input
                    id="fs-studentName"
                    name="studentName"
                    type="text"
                    required
                    placeholder="e.g. Zainab Khan"
                    className="form-input"
                    value={formData.studentName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fs-parentName" className="form-label required">
                    Parent / Guardian Name
                  </label>
                  <input
                    id="fs-parentName"
                    name="parentName"
                    type="text"
                    required
                    placeholder="e.g. Shabbir Bhai"
                    className="form-input"
                    value={formData.parentName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="fs-classApplied" className="form-label required">
                    Class (5th to 12th)
                  </label>
                  <select
                    id="fs-classApplied"
                    name="classApplied"
                    required
                    className="form-select"
                    value={formData.classApplied}
                    onChange={handleChange}
                  >
                    {['5', '6', '7', '8', '9', '10', '11', '12'].map((c) => (
                      <option key={c} value={c}>
                        Class {c}th
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="fs-phone" className="form-label required">
                    Mobile Phone (WhatsApp)
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">+91</span>
                    <input
                      id="fs-phone"
                      name="phone"
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      className="form-input with-prefix"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="fs-branch" className="form-label required">
                  Choose Branch
                </label>
                <select
                  id="fs-branch"
                  name="branch"
                  required
                  className="form-select"
                  value={formData.branch}
                  onChange={handleChange}
                >
                  {BRANCHES.map((b) => (
                    <option key={b.branchKey} value={b.branchKey}>
                      {b.name} ({b.landmark || b.address})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fs-notes" className="form-label">
                  Any Questions or Specific Subjects (Optional)
                </label>
                <input
                  id="fs-notes"
                  name="notes"
                  type="text"
                  placeholder="e.g. Want trial for Physics & Chemistry"
                  className="form-input"
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>

              <div className="modal-submit-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg btn-block"
                  style={{ background: '#020617', color: '#10b981', borderColor: '#10b981' }}
                >
                  {loading ? 'Registering Trial...' : 'Get 2-Day Free Session →'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
