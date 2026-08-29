import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import DocumentUploader from '../components/DocumentUploader';
import API from '../utils/api';
import './TutorialAdmission.css';

const CLASS_OPTIONS = [
  { value: '5', label: 'Class 5th' },
  { value: '6', label: 'Class 6th' },
  { value: '7', label: 'Class 7th' },
  { value: '8', label: 'Class 8th' },
  { value: '9', label: 'Class 9th' },
  { value: '10', label: 'Class 10th' },
  { value: '11', label: 'Class 11th' },
  { value: '12', label: 'Class 12th' },
];

export default function TutorialAdmission() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      studentName: '',
      fatherName: '',
      motherName: '',
      phone: '',
      dob: '',
      classApplied: '',
      schoolName: '',
      address: '',
      branch: '',
    },
  });

  const selectedClass = watch('classApplied');

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
    if (file) setFileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateDocs = () => {
    const required = ['photograph', 'aadhar'];
    const errs = {};
    required.forEach(doc => {
      if (!files[doc]) {
        const readable = {
          photograph: 'Student Photograph is required',
          aadhar: 'Aadhar Card is required',
        };
        errs[doc] = readable[doc] || 'This document is required';
      }
    });
    setFileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (data) => {
    const isDocValid = validateDocs();
    if (!isDocValid) {
      toast.error('Please upload all required documents');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      // Append text fields
      Object.entries(data).forEach(([key, val]) => {
        if (val !== undefined && val !== '') formData.append(key, String(val).trim());
      });

      // Append files
      Object.entries(files).forEach(([key, file]) => {
        if (file) formData.append(key, file);
      });

      const res = await API.post('/admissions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Admission form submitted successfully!');
      navigate('/success', {
        state: {
          id: res.data._id || res.data.applicationId,
          applicationId: res.data.applicationId,
          studentName: res.data.studentName,
          classApplied: res.data.classApplied,
          submittedAt: res.data.submittedAt,
          admission: res.data.admission,
          formType: 'admission',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please check your information.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admission-page">
      <Navbar />

      {/* Page Header */}
      <div className="admission-header">
        <div className="container">
          <div className="admission-badge">
            <span className="badge-dot" /> Admissions Open 2026-27
          </div>
          <h1>Burhani Tutorials Admission Form</h1>
          <p className="admission-header-sub">Classes 5th to 12th — 30+ Years of Excellence in Quality Coaching</p>
        </div>
      </div>

      <div className="container admission-form-container">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* SECTION 1: STUDENT & PARENT DETAILS */}
          <div className="admission-card">
            <div className="admission-card-header">
              <div className="card-icon">👤</div>
              <div>
                <h2>Student & Parent Details</h2>
                <p>Fill in the student and family particulars accurately</p>
              </div>
            </div>

            <div className="admission-card-body">
              <div className="form-grid form-grid-2">
                {/* 1. Student Name */}
                <div className="form-group">
                  <label className="form-label">
                    Student Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${errors.studentName ? ' error' : ''}`}
                    placeholder="Full name of student"
                    {...register('studentName', { required: 'Student name is required' })}
                  />
                  {errors.studentName && <p className="form-error">{errors.studentName.message}</p>}
                </div>

                {/* 2. Father Name */}
                <div className="form-group">
                  <label className="form-label">
                    Father's Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${errors.fatherName ? ' error' : ''}`}
                    placeholder="Father's full name"
                    {...register('fatherName', { required: "Father's name is required" })}
                  />
                  {errors.fatherName && <p className="form-error">{errors.fatherName.message}</p>}
                </div>

                {/* 3. Mother Name */}
                <div className="form-group">
                  <label className="form-label">
                    Mother's Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${errors.motherName ? ' error' : ''}`}
                    placeholder="Mother's full name"
                    {...register('motherName', { required: "Mother's name is required" })}
                  />
                  {errors.motherName && <p className="form-error">{errors.motherName.message}</p>}
                </div>

                {/* 4. Student Mobile No. */}
                <div className="form-group">
                  <label className="form-label">
                    Student Mobile No. <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    className={`form-input${errors.phone ? ' error' : ''}`}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    {...register('phone', {
                      required: 'Mobile number is required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Enter a valid 10-digit Indian mobile number',
                      },
                    })}
                  />
                  {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                </div>

                {/* 5. DOB */}
                <div className="form-group">
                  <label className="form-label">
                    Date of Birth (DOB) <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    className={`form-input${errors.dob ? ' error' : ''}`}
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dob', {
                      required: 'Date of birth is required',
                      validate: v => new Date(v) < new Date() || 'Date of birth cannot be in the future',
                    })}
                  />
                  {errors.dob && <p className="form-error">{errors.dob.message}</p>}
                </div>

                {/* 6. Class (5 to 12) */}
                <div className="form-group">
                  <label className="form-label">
                    Class Applying For <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select${errors.classApplied ? ' error' : ''}`}
                    {...register('classApplied', { required: 'Please select a class' })}
                  >
                    <option value="">Select Class (5th to 12th)</option>
                    {CLASS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.classApplied && <p className="form-error">{errors.classApplied.message}</p>}
                </div>

                {/* 7. Branch */}
                <div className="form-group">
                  <label className="form-label">
                    Branch <span className="required">*</span>
                  </label>
                  <select
                    className={`form-select${errors.branch ? ' error' : ''}`}
                    {...register('branch', { required: 'Please select a branch' })}
                  >
                    <option value="">Select Preferred Branch</option>
                    <option value="Noorani Nagar">Noorani Nagar</option>
                    <option value="Saify Nagar">Saify Nagar</option>
                    <option value="Masakin-E-Saifiya">Masakin-E-Saifiya</option>
                  </select>
                  {errors.branch && <p className="form-error">{errors.branch.message}</p>}
                </div>

                {/* 8. School Name */}
                <div className="form-group">
                  <label className="form-label">
                    School Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${errors.schoolName ? ' error' : ''}`}
                    placeholder="Current / Previous School Name"
                    {...register('schoolName', { required: 'School name is required' })}
                  />
                  {errors.schoolName && <p className="form-error">{errors.schoolName.message}</p>}
                </div>

                {/* 9. Address (Single line) */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">
                    Address <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input${errors.address ? ' error' : ''}`}
                    placeholder="Complete residential address"
                    {...register('address', { required: 'Address is required' })}
                  />
                  {errors.address && <p className="form-error">{errors.address.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: UPLOAD DOCUMENTS */}
          <div className="admission-card">
            <div className="admission-card-header">
              <div className="card-icon">📎</div>
              <div>
                <h2>Upload Documents</h2>
                <p>Upload clear scanned copies or photographs (JPG, PNG, PDF up to 1MB each)</p>
              </div>
            </div>

            <div className="admission-card-body">
              <div className="docs-grid">
                {/* 1. Photograph */}
                <DocumentUploader
                  label="Student Photograph"
                  hint="Passport size recent color photo"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  onChange={f => handleFileChange('photograph', f)}
                  error={fileErrors.photograph}
                />

                {/* 2. Aadhar Card */}
                <DocumentUploader
                  label="Aadhar Card"
                  hint="Student's Aadhar Card copy"
                  required
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={f => handleFileChange('aadhar', f)}
                  error={fileErrors.aadhar}
                />
              </div>

              {/* Notice about signature */}
              <div style={{
                marginTop: 16,
                padding: '12px 16px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 8,
                fontSize: '0.85rem',
                color: '#1e40af',
                lineHeight: 1.6,
              }}>
                ✍️ <strong>Parent / Guardian Signature:</strong> A blank signature box is included in your printed admission form. Please get the signature from your parent/guardian and submit the signed form to the institute.
              </div>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="admission-submit-wrap">
            <div className="admission-terms">
              <span>ℹ️</span> By submitting, I declare that all information provided is accurate and truthful.
            </div>
            <button
              type="submit"
              className="btn btn-accent btn-lg submit-admission-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting Application...' : 'Submit Admission Form →'}
            </button>
            <div className="admission-alt-link">
              Looking for State Board Examination Registration?{' '}
              <Link to="/select-class">Fill Board Form here</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
