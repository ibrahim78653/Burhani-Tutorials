const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // 'photograph', 'aadhar', 'parentSignature'
  originalName: String,
  storedName: String,
  mimeType: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const admissionSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, required: true },
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  phone: { type: String, required: true },
  dob: { type: String, required: true },
  classApplied: { type: String, enum: ['5', '6', '7', '8', '9', '10', '11', '12'], required: true },
  schoolName: { type: String, required: true },
  address: { type: String, required: true },
  branch: { type: String, enum: ['Noorani Nagar', 'Saify Nagar', 'Masakin-E-Saifiya'], required: true },
  documents: [documentSchema],
  status: { type: String, enum: ['submitted', 'under_review', 'approved', 'rejected'], default: 'submitted' },
  isArchived: { type: Boolean, default: false },
  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

admissionSchema.index({ studentName: 'text', fatherName: 'text', phone: 'text', schoolName: 'text', address: 'text', branch: 'text' });
admissionSchema.index({ classApplied: 1, status: 1 });

module.exports = mongoose.model('Admission', admissionSchema);
