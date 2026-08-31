const mongoose = require('mongoose');

const feeItemSchema = new mongoose.Schema({
  feeType: {
    type: String,
    enum: ['TUITION_FEE'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
}, { _id: false });

const feeReceiptSchema = new mongoose.Schema({
  receiptNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
  },

  // Multi-item support: one receipt can have both Form Fee + Tuition Fee
  feeItems: {
    type: [feeItemSchema],
    required: true,
    validate: {
      validator: function (items) {
        return Array.isArray(items) && items.length >= 1;
      },
      message: 'At least one fee item is required',
    },
  },

  // Summary field: 'TUITION_FEE'
  // Derived from feeItems for quick indexing/filtering
  receiptCategory: {
    type: String,
    enum: ['TUITION_FEE'],
    required: true,
  },

  // Total of all feeItems (for search/sort indexing)
  amountPaid: {
    type: Number,
    required: true,
    min: 0.01,
  },

  amountInWords: {
    type: String,
    required: true,
    trim: true,
  },

  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  studentNameNormalized: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  classApplied: {
    type: String,
    required: true,
    trim: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  invoiceDate: {
    type: Date,
    required: true,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'],
    required: true,
  },
  remarks: {
    type: String,
    default: '',
    trim: true,
  },
  pdfFileName: {
    type: String,
    required: true,
  },
  pdfStoredName: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    default: 'Admin',
    trim: true,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for performance
feeReceiptSchema.index({ studentNameNormalized: 1 });
feeReceiptSchema.index({ invoiceDate: -1 });
feeReceiptSchema.index({ receiptCategory: 1, invoiceDate: -1 });
feeReceiptSchema.index({ branch: 1, classApplied: 1 });
feeReceiptSchema.index({ amountPaid: 1 });
feeReceiptSchema.index({ isArchived: 1, createdAt: -1 });
feeReceiptSchema.index({ 'feeItems.feeType': 1 });

module.exports = mongoose.model('FeeReceipt', feeReceiptSchema);
