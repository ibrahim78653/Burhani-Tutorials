import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import DocumentUploader from '../components/DocumentUploader';
import API from '../utils/api';
import './AdmissionForm.css';

// ── FORM STEP CONFIG ──────────────────────────────────────────
const getSteps = (classId) => {
  const base = [
    { id: 'personal', label: 'Personal' },
    { id: 'address', label: 'Address' },
    { id: 'languages', label: classId <= '10' ? 'Languages' : 'Languages & Subjects' },
    { id: 'academic', label: 'Academic' },
  ];
  if (classId === '10' || classId === '12') base.push({ id: 'bank', label: 'Bank Details' });
  base.push({ id: 'documents', label: 'Documents' });
  base.push({ id: 'review', label: 'Review' });
  return base;
};

const CLASS_LABELS = { '9': '9th', '10': '10th', '11': '11th', '12': '12th' };

export default function AdmissionForm() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const steps = getSteps(classId);

  const { register, handleSubmit, watch, formState: { errors }, trigger, getValues, setValue } = useForm({
    defaultValues: {
      state: 'Madhya Pradesh',
      residenceOfMP: 'Yes',
      gender: '',
      medium: '',
      mpBoard: 'Yes',
    }
  });

  // Validate redirect
  useEffect(() => {
    if (!['9', '10', '11', '12'].includes(classId)) navigate('/select-class');
  }, [classId, navigate]);

  const handleFileChange = (name, file) => {
    setFiles(prev => ({ ...prev, [name]: file }));
    if (file) setFileErrors(prev => ({ ...prev, [name]: '' }));
  };

  const isSeniorSecondary = classId === '11' || classId === '12';
  const nameDocLabel = isSeniorSecondary ? '10th Marksheet' : 'Aadhar Card';

  // Step-specific required fields for validation
  const stepFields = {
    personal: ['studentName', 'fatherName', 'motherName', 'dob', 'medium', 'gender', 'phone', 'ssmid', 'residenceOfMP'],
    address: ['addressLine', 'city', 'state', 'pinCode'],
    languages: classId <= '10'
      ? ['firstLanguage', 'secondLanguage', 'thirdLanguage']
      : ['firstLanguage', 'secondLanguage', 'subject1', 'subject2', 'subject3'],
    academic: classId === '9' ? ['class8Board'] : classId === '10' ? ['class8Board'] : classId === '11' ? ['class10Board', 'class10Roll', 'class10Percentage'] : ['class10Board', 'class10Roll', 'class10Percentage'],
    bank: (classId === '10' || classId === '12') ? ['bankAccountNumber', 'ifscCode'] : [],
  };

  const validateDocuments = () => {
    const required = {
      '9': ['photograph', 'aadhar', 'samagra', 'signature', 'transferCertificate'],
      '10': ['photograph', 'aadhar', 'samagra', 'signature', 'transferCertificate'],
      '11': ['photograph', 'aadhar', 'samagra', 'signature', 'class10Marksheet', 'transferCertificate', 'migrationCertificate'],
      '12': ['photograph', 'aadhar', 'samagra', 'signature', 'class10Marksheet', 'transferCertificate', 'migrationCertificate'],
    }[classId] || [];

    const errs = {};
    required.forEach(doc => { if (!files[doc]) errs[doc] = 'This document is required'; });
    setFileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = async () => {
    const currentStep = steps[step];
    const fields = stepFields[currentStep.id] || [];
    const valid = fields.length ? await trigger(fields) : true;
    if (currentStep.id === 'documents' && !validateDocuments()) return;
    if (valid) setStep(s => Math.min(s + 1, steps.length - 1));
    else toast.error('Please fill in all required fields');
  };

  const goPrev = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async () => {
    if (!validateDocuments()) { toast.error('Please upload all required documents'); return; }
    setSubmitting(true);
    try {
      const data = getValues();
      const formData = new FormData();

      // Append all text fields
      Object.entries(data).forEach(([key, val]) => { if (val !== undefined && val !== '') formData.append(key, val); });
      formData.append('classApplied', classId);

      // Append files
      Object.entries(files).forEach(([key, file]) => { if (file) formData.append(key, file); });

      const res = await API.post('/students', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      navigate('/success', {
        state: {
          id: res.data._id || res.data.applicationId,
          applicationId: res.data.applicationId,
          studentName: res.data.studentName,
          classApplied: classId,
          submittedAt: res.data.submittedAt,
          student: res.data.student,
          formType: 'board',
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formValues = watch();

  return (
    <div className="admission-form-page">
      <Navbar />

      {/* Page header */}
      <div className="form-page-header">
        <div className="container">
          <Link to="/select-class" className="back-link">← Change Class</Link>
          <h1>Class {CLASS_LABELS[classId]} Board Form</h1>
          <p>Burhani Tutorials — Academic Year 2026</p>
        </div>
      </div>

      {/* Progress */}
      <div className="form-progress-wrap">
        <div className="container">
          <div className="progress-steps">
            {steps.map((s, i) => (
              <div key={s.id} className={`step-item${i < step ? ' completed' : ''}${i === step ? ' active' : ''}`}>
                <div className="step-circle">{i < step ? '✓' : i + 1}</div>
                <div className="step-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container form-body">
        <form onSubmit={(e) => e.preventDefault()} noValidate>

          {/* ── STEP 0: PERSONAL ── */}
          {steps[step].id === 'personal' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header">
                  <span>👤</span><h2>Personal Details</h2>
                </div>
                <div className="section-card-body">
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Student Name as per {nameDocLabel} <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.studentName ? ' error' : ''}`}
                        {...register('studentName', { required: 'Student name is required' })}
                        placeholder={isSeniorSecondary ? "Full name as on 10th Marksheet" : "Full name as on Aadhar"}
                      />
                      {errors.studentName && <p className="form-error">{errors.studentName.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Father's Name as per {nameDocLabel} <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.fatherName ? ' error' : ''}`}
                        {...register('fatherName', { required: 'Father\'s name is required' })}
                        placeholder={isSeniorSecondary ? "Father's full name as on 10th Marksheet" : "Father's full name"}
                      />
                      {errors.fatherName && <p className="form-error">{errors.fatherName.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mother's Name as per {nameDocLabel} <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.motherName ? ' error' : ''}`}
                        {...register('motherName', { required: 'Mother\'s name is required' })}
                        placeholder={isSeniorSecondary ? "Mother's full name as on 10th Marksheet" : "Mother's full name"}
                      />
                      {errors.motherName && <p className="form-error">{errors.motherName.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of Birth <span className="required">*</span></label>
                      <input type="date" className={`form-input${errors.dob ? ' error' : ''}`} {...register('dob', {
                        required: 'Date of birth is required',
                        validate: v => new Date(v) < new Date() || 'Invalid date of birth'
                      })} max={new Date().toISOString().split('T')[0]} />
                      {errors.dob && <p className="form-error">{errors.dob.message}</p>}
                    </div>
                  </div>

                  <div className="form-grid form-grid-2" style={{ marginTop: 20 }}>
                    <div className="form-group">
                      <label className="form-label">Medium <span className="required">*</span></label>
                      <div className="radio-group">
                        {['Hindi', 'English'].map(m => (
                          <label key={m} className={`radio-option${formValues.medium === m ? ' selected' : ''}`}>
                            <input type="radio" value={m} {...register('medium', { required: 'Medium is required' })} /> {m}
                          </label>
                        ))}
                      </div>
                      {errors.medium && <p className="form-error">{errors.medium.message}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Gender <span className="required">*</span></label>
                      <div className="radio-group">
                        {['Male', 'Female'].map(g => (
                          <label key={g} className={`radio-option${formValues.gender === g ? ' selected' : ''}`}>
                            <input type="radio" value={g} {...register('gender', { required: 'Gender is required' })} /> {g}
                          </label>
                        ))}
                      </div>
                      {errors.gender && <p className="form-error">{errors.gender.message}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="required">*</span></label>
                      <input type="tel" className={`form-input${errors.phone ? ' error' : ''}`} {...register('phone', {
                        required: 'Phone number is required',
                        pattern: { value: /^[6-9]\d{9}$/, message: 'Enter a valid 10-digit Indian mobile number' }
                      })} placeholder="10-digit mobile number" maxLength={10} />
                      {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                    </div>

                    <div className="form-group">
                      <label className="form-label">SSMID (Samagra ID) Number <span className="required">*</span></label>
                      <input className={`form-input${errors.ssmid ? ' error' : ''}`} {...register('ssmid', {
                        required: 'SSMID (Samagra ID) is required',
                      })} placeholder="Enter SSMID / Samagra ID" />
                      {errors.ssmid && <p className="form-error">{errors.ssmid.message}</p>}
                    </div>

                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Residence of MP <span className="required">*</span></label>
                      <div className="radio-group">
                        {['Yes', 'No'].map(v => (
                          <label key={v} className={`radio-option${formValues.residenceOfMP === v ? ' selected' : ''}`}>
                            <input type="radio" value={v} {...register('residenceOfMP', { required: true })} /> {v}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 1: ADDRESS ── */}
          {steps[step].id === 'address' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header"><span>🏠</span><h2>Address Details</h2></div>
                <div className="section-card-body">
                  <div className="form-grid form-grid-2">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Address <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.addressLine ? ' error' : ''}`}
                        {...register('addressLine', { required: 'Address is required' })}
                        placeholder="House / Flat No., Street, Colony, Road / Area"
                      />
                      {errors.addressLine && <p className="form-error">{errors.addressLine.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">City <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.city ? ' error' : ''}`}
                        {...register('city', { required: 'City is required' })}
                        placeholder="City"
                      />
                      {errors.city && <p className="form-error">{errors.city.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">State <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.state ? ' error' : ''}`}
                        {...register('state', { required: 'State is required' })}
                        placeholder="State"
                      />
                      {errors.state && <p className="form-error">{errors.state.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code <span className="required">*</span></label>
                      <input
                        className={`form-input${errors.pinCode ? ' error' : ''}`}
                        {...register('pinCode', {
                          required: 'PIN code is required',
                          pattern: { value: /^\d{6}$/, message: 'PIN code must be 6 digits' }
                        })}
                        placeholder="6-digit PIN code"
                        maxLength={6}
                      />
                      {errors.pinCode && <p className="form-error">{errors.pinCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: LANGUAGES / SUBJECTS ── */}
          {steps[step].id === 'languages' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header">
                  <span>📚</span>
                  <h2>{classId <= '10' ? 'Language Details' : 'Languages & Subjects'}</h2>
                </div>
                <div className="section-card-body">
                  <div className="form-grid form-grid-2">
                    <div className="form-group">
                      <label className="form-label">1st Language <span className="required">*</span></label>
                      <input className={`form-input${errors.firstLanguage ? ' error' : ''}`} {...register('firstLanguage', { required: '1st Language is required' })} placeholder="e.g., Hindi" />
                      {errors.firstLanguage && <p className="form-error">{errors.firstLanguage.message}</p>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">2nd Language <span className="required">*</span></label>
                      <input className={`form-input${errors.secondLanguage ? ' error' : ''}`} {...register('secondLanguage', { required: '2nd Language is required' })} placeholder="e.g., English" />
                      {errors.secondLanguage && <p className="form-error">{errors.secondLanguage.message}</p>}
                    </div>
                    {classId <= '10' && (
                      <div className="form-group">
                        <label className="form-label">3rd Language <span className="required">*</span></label>
                        <input className={`form-input${errors.thirdLanguage ? ' error' : ''}`} {...register('thirdLanguage', { required: '3rd Language is required' })} placeholder="e.g., Sanskrit" />
                        {errors.thirdLanguage && <p className="form-error">{errors.thirdLanguage.message}</p>}
                      </div>
                    )}
                  </div>

                  {classId >= '11' && (
                    <>
                      <div className="form-divider"><span>Subjects</span></div>
                      <div className="alert alert-info" style={{ marginBottom: 16 }}>
                        <span>ℹ️</span> First three subjects are mandatory. 4th subject is optional.
                      </div>
                      <div className="form-grid form-grid-2">
                        {['1st Subject', '2nd Subject', '3rd Subject'].map((label, i) => {
                          const name = `subject${i + 1}`;
                          return (
                            <div key={name} className="form-group">
                              <label className="form-label">{label} <span className="required">*</span></label>
                              <input className={`form-input${errors[name] ? ' error' : ''}`} {...register(name, { required: `${label} is required` })} placeholder={`e.g., Physics`} />
                              {errors[name] && <p className="form-error">{errors[name].message}</p>}
                            </div>
                          );
                        })}
                        <div className="form-group">
                          <label className="form-label">4th Subject <span className="form-optional">(Optional)</span></label>
                          <input className="form-input" {...register('subject4')} placeholder="Optional subject" />
                        </div>
                      </div>
                    </>
                  )}

                  {(classId === '11' || classId === '12') && (
                    <>
                      <div className="form-divider"><span>MP Board</span></div>
                      <div className="form-group">
                        <label className="form-label">MP Board or Not? <span className="required">*</span></label>
                        <div className="radio-group">
                          {['Yes', 'No'].map(v => (
                            <label key={v} className={`radio-option${formValues.mpBoard === v ? ' selected' : ''}`}>
                              <input type="radio" value={v} {...register('mpBoard')} /> {v}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: ACADEMIC ── */}
          {steps[step].id === 'academic' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header"><span>🎓</span><h2>Previous Academic Details</h2></div>
                <div className="section-card-body">

                  {/* Class 8 — for 9, 10, 11 | Class 11 — for 12 */}
                  {classId !== '12' ? (
                    <div className="academic-block">
                      <h3 className="academic-block-title">Class 8 Details</h3>
                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Board Name {classId === '9' && <span className="required">*</span>}</label>
                          <input className="form-input" {...register('class8Board', classId === '9' ? { required: 'Board name is required' } : {})} placeholder="e.g., MPBSE" />
                          {errors.class8Board && <p className="form-error">{errors.class8Board.message}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Roll Number</label>
                          <input className="form-input" {...register('class8Roll')} placeholder="Roll number" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Result / Percentage</label>
                          <input type="number" className="form-input" {...register('class8Percentage', { min: { value: 0, message: 'Min 0%' }, max: { value: 100, message: 'Max 100%' } })} placeholder="e.g., 78.5" step="0.01" />
                          {errors.class8Percentage && <p className="form-error">{errors.class8Percentage.message}</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="academic-block">
                      <h3 className="academic-block-title">Class 11 Details <span className="form-optional">(Optional)</span></h3>
                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Board Name</label>
                          <input className="form-input" {...register('class11Board')} placeholder="e.g., MPBSE" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Roll Number</label>
                          <input className="form-input" {...register('class11Roll')} placeholder="Roll number" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Result / Percentage</label>
                          <input type="number" className="form-input" {...register('class11Percentage', { min: { value: 0, message: 'Min 0%' }, max: { value: 100, message: 'Max 100%' } })} placeholder="e.g., 78.5" step="0.01" />
                          {errors.class11Percentage && <p className="form-error">{errors.class11Percentage.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Class 9 — only for class 10 */}
                  {classId === '10' && (
                    <div className="academic-block">
                      <h3 className="academic-block-title">Class 9 Details <span className="form-optional">(Optional)</span></h3>
                      <div className="form-grid form-grid-2">
                        <div className="form-group"><label className="form-label">Board Name</label><input className="form-input" {...register('class9Board')} placeholder="e.g., MPBSE" /></div>
                        <div className="form-group"><label className="form-label">Roll Number</label><input className="form-input" {...register('class9Roll')} placeholder="Roll number" /></div>
                        <div className="form-group"><label className="form-label">Result / Percentage</label><input type="number" className="form-input" {...register('class9Percentage', { min: 0, max: 100 })} placeholder="e.g., 78.5" step="0.01" /></div>
                      </div>
                    </div>
                  )}

                  {/* Class 10 — for class 11 & 12 */}
                  {(classId === '11' || classId === '12') && (
                    <div className="academic-block">
                      <h3 className="academic-block-title">Class 10 Details <span className="required">*</span></h3>
                      <div className="form-grid form-grid-2">
                        <div className="form-group">
                          <label className="form-label">Board Name <span className="required">*</span></label>
                          <input className={`form-input${errors.class10Board ? ' error' : ''}`} {...register('class10Board', { required: 'Board name is required' })} placeholder="e.g., MPBSE" />
                          {errors.class10Board && <p className="form-error">{errors.class10Board.message}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Roll Number <span className="required">*</span></label>
                          <input className={`form-input${errors.class10Roll ? ' error' : ''}`} {...register('class10Roll', { required: 'Roll number is required' })} placeholder="Roll number" />
                          {errors.class10Roll && <p className="form-error">{errors.class10Roll.message}</p>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Result / Percentage <span className="required">*</span></label>
                          <input type="number" className={`form-input${errors.class10Percentage ? ' error' : ''}`} {...register('class10Percentage', { required: 'Percentage is required', min: 0, max: 100 })} placeholder="e.g., 78.5" step="0.01" />
                          {errors.class10Percentage && <p className="form-error">{errors.class10Percentage.message}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: BANK DETAILS (Class 10 & 12) ── */}
          {steps[step].id === 'bank' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header"><span>🏦</span><h2>Bank Details</h2></div>
                <div className="section-card-body">
                  <div className="alert alert-warning" style={{ marginBottom: 20 }}>
                    <span>⚠️</span> Bank details are required for Class {CLASS_LABELS[classId]} scholarship and fee purposes. Your information is stored securely.
                  </div>
                  <div className="form-grid form-grid-2">
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">Bank Account Number <span className="required">*</span></label>
                      <input type="text" className={`form-input${errors.bankAccountNumber ? ' error' : ''}`}
                        {...register('bankAccountNumber', { required: 'Account number is required', minLength: { value: 9, message: 'Invalid account number' } })}
                        placeholder="Bank account number" autoComplete="off" />
                      {errors.bankAccountNumber && <p className="form-error">{errors.bankAccountNumber.message}</p>}
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="form-label">IFSC Code <span className="required">*</span></label>
                      <input className={`form-input${errors.ifscCode ? ' error' : ''}`}
                        {...register('ifscCode', {
                          required: 'IFSC code is required',
                          pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format (e.g., SBIN0001234)' }
                        })}
                        placeholder="e.g., SBIN0001234" style={{ textTransform: 'uppercase' }} />
                      {errors.ifscCode && <p className="form-error">{errors.ifscCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: DOCUMENTS ── */}
          {steps[step].id === 'documents' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header"><span>📎</span><h2>Document Upload</h2></div>
                <div className="section-card-body">
                  <div className="docs-grid">
                    <DocumentUploader label="Passport Photograph" required hint="Recent passport-size photo with light background, clear face, front-facing." accept="image/jpeg,image/png" onChange={f => handleFileChange('photograph', f)} error={fileErrors.photograph} showPreview />
                    <DocumentUploader label="Aadhar Card" required accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('aadhar', f)} error={fileErrors.aadhar} />
                    <DocumentUploader label="Samagra ID / SSMID" required accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('samagra', f)} error={fileErrors.samagra} />
                    <DocumentUploader label="Transfer Certificate (TC)" required accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('transferCertificate', f)} error={fileErrors.transferCertificate} />
                    {(classId === '11' || classId === '12') && (
                      <DocumentUploader label="Migration Certificate" required accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('migrationCertificate', f)} error={fileErrors.migrationCertificate} />
                    )}
                    {(classId === '11' || classId === '12') && (
                      <DocumentUploader label="Class 10 Marksheet" required accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('class10Marksheet', f)} error={fileErrors.class10Marksheet} />
                    )}
                    {classId === '12' && (
                      <DocumentUploader label="Class 11 Marksheet" hint="Optional" accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('class11Marksheet', f)} />
                    )}
                    {classId !== '12' && (
                      <DocumentUploader label="Class 8 Marksheet" hint="Optional" accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('class8Marksheet', f)} />
                    )}
                    {classId === '10' && (
                      <DocumentUploader label="Class 9 Marksheet" hint="Optional" accept="image/jpeg,image/png,application/pdf" onChange={f => handleFileChange('class9Marksheet', f)} />
                    )}
                    <DocumentUploader label="Student Signature" required hint="Sign on white paper and upload a clear photo/scan." accept="image/jpeg,image/png" onChange={f => handleFileChange('signature', f)} error={fileErrors.signature} showPreview />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP: REVIEW ── */}
          {steps[step].id === 'review' && (
            <div className="form-section">
              <div className="section-card">
                <div className="section-card-header"><span>✅</span><h2>Review & Confirm</h2></div>
                <div className="section-card-body">
                  <div className="alert alert-info" style={{ marginBottom: 20 }}>
                    <span>ℹ️</span> Please review your details carefully before submitting. You can go back to edit.
                  </div>

                  <ReviewSection title="Personal Details" data={[
                    ['Student Name', formValues.studentName],
                    ['Father\'s Name', formValues.fatherName],
                    ['Mother\'s Name', formValues.motherName],
                    ['Date of Birth', formValues.dob],
                    ['Gender', formValues.gender],
                    ['Medium', formValues.medium],
                    ['Phone', formValues.phone],
                    ['SSMID (Samagra ID)', formValues.ssmid],
                    ['Residence of MP', formValues.residenceOfMP],
                  ]} />

                  <ReviewSection title="Address" data={[
                    ['Address', formValues.addressLine],
                    ['City', formValues.city],
                    ['State', formValues.state],
                    ['PIN Code', formValues.pinCode],
                  ]} />

                  <ReviewSection title={classId <= '10' ? 'Languages' : 'Languages & Subjects'} data={[
                    ['1st Language', formValues.firstLanguage],
                    ['2nd Language', formValues.secondLanguage],
                    ...(classId <= '10' ? [['3rd Language', formValues.thirdLanguage]] : []),
                    ...(classId >= '11' ? [
                      ['1st Subject', formValues.subject1],
                      ['2nd Subject', formValues.subject2],
                      ['3rd Subject', formValues.subject3],
                      ['4th Subject', formValues.subject4 || '—'],
                      ['MP Board', formValues.mpBoard],
                    ] : []),
                  ]} />

                  <ReviewSection title="Academic Details" data={[
                    ...(classId !== '12' ? [
                      ['Class 8 Board', formValues.class8Board],
                      ['Class 8 Roll', formValues.class8Roll],
                      ['Class 8 %', formValues.class8Percentage],
                    ] : [
                      ['Class 11 Board', formValues.class11Board],
                      ['Class 11 Roll', formValues.class11Roll],
                      ['Class 11 %', formValues.class11Percentage],
                    ]),
                    ...(classId === '10' ? [['Class 9 Board', formValues.class9Board], ['Class 9 Roll', formValues.class9Roll]] : []),
                    ...(classId >= '11' ? [['Class 10 Board', formValues.class10Board], ['Class 10 Roll', formValues.class10Roll], ['Class 10 %', formValues.class10Percentage]] : []),
                  ]} />

                  {(classId === '10' || classId === '12') && (
                    <ReviewSection title="Bank Details" data={[
                      ['Account No.', formValues.bankAccountNumber ? '****' + formValues.bankAccountNumber.slice(-4) : '—'],
                      ['IFSC Code', formValues.ifscCode],
                    ]} />
                  )}

                  <div className="review-docs">
                    <h3 className="review-section-title">Documents Uploaded</h3>
                    <div className="docs-checklist">
                      {Object.entries(files).map(([name, file]) => (
                        <div key={name} className="doc-check-item">
                          <span className="doc-check-icon">✓</span>
                          <span>{name.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="review-confirm-note">
                    By clicking "Submit Board Form", I confirm that all information provided is accurate and complete.
                  </div>
                </div>
              </div>
            </div>
          )}

        </form>
      </div>

      {/* ── NAVIGATION BAR (sticky bottom) ── */}
      <div className="form-nav-bar">
        <div className="container form-nav-inner">
          <button type="button" onClick={goPrev} disabled={step === 0} className="btn btn-outline">
            ← Previous
          </button>
          <div className="form-nav-step-info">
            Step {step + 1} of {steps.length}
          </div>
          {step < steps.length - 1 ? (
            <button type="button" onClick={goNext} className="btn btn-primary">
              Next →
            </button>
          ) : (
            <button type="button" onClick={onSubmit} disabled={submitting} className="btn btn-accent">
              {submitting ? (<><div className="spinner spinner-sm" /> Submitting...</>) : '🎓 Submit Board Form'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Helper: ReviewSection ──
function ReviewSection({ title, data }) {
  return (
    <div className="review-section">
      <h3 className="review-section-title">{title}</h3>
      <div className="card" style={{ overflow: 'visible', marginBottom: 16 }}>
        <table className="review-table">
          <tbody>
            {data.filter(([_, v]) => v).map(([label, value]) => (
              <tr key={label}>
                <th>{label}</th>
                <td>{value || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
