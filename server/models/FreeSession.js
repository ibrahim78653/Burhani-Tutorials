const mongoose = require('mongoose');

const freeSessionSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
  },
  parentName: {
    type: String,
    required: [true, 'Parent name is required'],
    trim: true,
  },
  classApplied: {
    type: String,
    required: [true, 'Class is required'],
    enum: ['5', '6', '7', '8', '9', '10', '11', '12'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
  },
  branch: {
    type: String,
    required: [true, 'Branch selection is required'],
    enum: [
      'Noorani Nagar',
      'Saify Nagar',
      'Masakin-E-Saifiya',
    ],
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Scheduled', 'Completed', 'Cancelled'],
    default: 'New',
    index: true,
  },
  adminNotes: {
    type: String,
    default: '',
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FreeSession', freeSessionSchema);
