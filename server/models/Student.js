const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  addressLine: String,
  houseNo: String,
  street: String,
  city: String,
  district: String,
  state: { type: String, default: 'Madhya Pradesh' },
  pinCode: String,
}, { _id: false });

const academicSchema = new mongoose.Schema({
  boardName: String,
  rollNumber: String,
  percentage: String,
}, { _id: false });

const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  originalName: String,
  storedName: String,
  mimeType: String,
  size: Number,
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const studentSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, required: true },
  classApplied: { type: String, enum: ['9', '10', '11', '12'], required: true },

  // Personal
  studentName: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String, required: true },
  dob: { type: String, required: true },
  dobWords: { type: String, required: false },
  medium: { type: String, enum: ['Hindi', 'English'], required: true },
  gender: { type: String, enum: ['Male', 'Female'], required: true },
  phone: { type: String, required: true },
  residenceOfMP: { type: String, enum: ['Yes', 'No'], required: true },

  // Address
  address: addressSchema,

  // Languages (9,10 → 3 langs; 11,12 → 2 langs)
  firstLanguage: String,
  secondLanguage: String,
  thirdLanguage: String, // only for 9 & 10

  // Subjects (11 & 12 only)
  subject1: String,
  subject2: String,
  subject3: String,
  subject4: String, // optional

  // Academic
  class8Details: academicSchema,
  class9Details: academicSchema,  // class 10+
  class10Details: academicSchema, // class 11+
  class11Details: academicSchema, // class 12 only (optional)

  // MP Board (11 & 12)
  mpBoard: { type: String, enum: ['Yes', 'No'] },

  // Samagra / SSMID (mandatory for all classes)
  ssmid: { type: String, required: true },

  // Bank details (class 10 & 12)
  bankAccountNumber: String,
  ifscCode: String,

  // Documents
  documents: [documentSchema],

  // Status
  status: { type: String, enum: ['submitted', 'under_review', 'approved', 'rejected'], default: 'submitted' },
  isArchived: { type: Boolean, default: false },

  submittedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Index for searching
studentSchema.index({ studentName: 'text', fatherName: 'text', phone: 'text' });
studentSchema.index({ classApplied: 1, status: 1 });

module.exports = mongoose.model('Student', studentSchema);
