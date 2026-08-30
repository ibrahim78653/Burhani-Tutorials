import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BRANCHES } from '../data/instituteData';
import { formatWhatsAppAppointmentMessage, openWhatsAppChat } from '../utils/whatsapp';
import './AppointmentModal.css';

export default function AppointmentModal({ isOpen, onClose, initialBranch = '', initialClass = '', initialStream = '' }) {
  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    classApplied: initialClass || '10',
    stream: initialStream || '',
    phone: '',
    branch: initialBranch || 'Noorani Nagar',
    preferredDate: '',
    message: '',
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
        stream: initialStream || prev.stream || '',
      }));
      setSubmittedData(null);
      setWhatsappInfo(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, initialBranch, initialClass, initialStream]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Reset stream if class changed to below 11th
      if (name === 'classApplied' && !['11', '12'].includes(value)) {
        updated.stream = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
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
      const response = await axios.post('/api/appointments', {
        ...formData,
        phone: cleanPhone,
      });

      if (response.data.success) {
        setSubmittedData(response.data.appointment);
        setWhatsappInfo(response.data.whatsapp);
        toast.success('Appointment booked successfully!');

        // Automatically open WhatsApp chat in new window
        if (response.data.whatsapp?.message) {
          openWhatsAppChat(response.data.whatsapp.message);
        }
      }
    } catch (err) {
      console.error('Appointment error:', err);
      toast.error(err.response?.data?.message || 'Failed to submit appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualWhatsApp = () => {
    if (whatsappInfo?.message) {
      openWhatsAppChat(whatsappInfo.message);
    } else if (submittedData) {
      const msg = formatWhatsAppAppointmentMessage(submittedData);
      openWhatsAppChat(msg);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-container appointment-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header appointment-modal-header">
          <div className="modal-brand-badge">
            <span className="modal-brand-dot" />
            Burhani Tutorials • Since 1996
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">✕</button>
          <h2 id="modal-title" className="modal-title">
            {submittedData ? 'Appointment Confirmed!' : 'Book an In-Person Academic Appointment'}
          </h2>
          <p className="modal-subtitle">
            {submittedData
              ? 'Your appointment request has been recorded in our institute database.'
              : 'Meet our founders & teachers directly at your preferred Indore branch.'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {submittedData ? (
            <div className="modal-success-card">
              <div className="success-icon-wrap">
                <span className="success-checkmark">✓</span>
              </div>
              <h3 className="success-heading">Thank You!</h3>
              <p className="success-sub">
                Your request has been successfully submitted. Our team will contact you shortly to confirm the appointment timing.
              </p>

              <div className="success-id-box">
                <span className="success-id-label">Appointment ID:</span>
                <span className="success-id-val">{submittedData.appointmentId}</span>
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
                  <strong>
                    Class {submittedData.classApplied}th {submittedData.stream ? `(${submittedData.stream})` : ''}
                  </strong>
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
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="appointment-form" noValidate>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="studentName" className="form-label required">
                    Student Full Name
                  </label>
                  <input
                    id="studentName"
                    name="studentName"
                    type="text"
                    required
                    placeholder="e.g. Murtaza Ali"
                    className="form-input"
                    value={formData.studentName}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="parentName" className="form-label required">
                    Parent / Guardian Name
                  </label>
                  <input
                    id="parentName"
                    name="parentName"
                    type="text"
                    required
                    placeholder="e.g. Yusuf Bhai"
                    className="form-input"
                    value={formData.parentName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="classApplied" className="form-label required">
                    Class
                  </label>
                  <select
                    id="classApplied"
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

                {['11', '12'].includes(formData.classApplied) ? (
                  <div className="form-group">
                    <label htmlFor="stream" className="form-label">
                      Stream (Optional)
                    </label>
                    <select
                      id="stream"
                      name="stream"
                      className="form-select"
                      value={formData.stream}
                      onChange={handleChange}
                    >
                      <option value="">Select Stream</option>
                      <option value="PCM">Science — PCM (Physics, Chem, Math)</option>
                      <option value="PCB">Science — PCB (Physics, Chem, Bio)</option>
                      <option value="Commerce">Commerce (Accounts, Business, Arts)</option>
                    </select>
                  </div>
                ) : (
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label required">
                      Contact Phone (WhatsApp)
                    </label>
                    <div className="input-prefix-wrap">
                      <span className="input-prefix">+91</span>
                      <input
                        id="phone"
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
                )}
              </div>

              {['11', '12'].includes(formData.classApplied) && (
                <div className="form-group">
                  <label htmlFor="phone" className="form-label required">
                    Contact Phone (WhatsApp)
                  </label>
                  <div className="input-prefix-wrap">
                    <span className="input-prefix">+91</span>
                    <input
                      id="phone"
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
              )}

              <div className="form-group">
                <label htmlFor="branch" className="form-label required">
                  Select Preferred Branch
                </label>
                <select
                  id="branch"
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

              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="preferredDate" className="form-label">
                    Preferred Visit Date (Optional)
                  </label>
                  <input
                    id="preferredDate"
                    name="preferredDate"
                    type="date"
                    className="form-input"
                    value={formData.preferredDate}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Special Query / Note (Optional)
                  </label>
                  <input
                    id="message"
                    name="message"
                    type="text"
                    placeholder="e.g. Interested in morning batch"
                    className="form-input"
                    value={formData.message}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="modal-footer-notes">
                <span className="note-icon">🔒</span>
                <span>Your contact details are kept strictly private & stored securely in our database.</span>
              </div>

              <div className="modal-submit-wrap">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-accent btn-lg btn-block"
                >
                  {loading ? (
                    <span className="btn-spinner-text">Submitting Appointment...</span>
                  ) : (
                    'Confirm & Book Appointment →'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
