const express = require('express');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const upload = require('../middleware/upload');
const router = express.Router();

// Generate Application ID: BT-2026-XXXXXX
async function generateAppId() {
  const year = new Date().getFullYear();
  const count = await Student.countDocuments();
  const num = String(count + 1).padStart(6, '0');
  return `BT-${year}-${num}`;
}

// POST /api/students - submit board form (multipart)
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'samagra', maxCount: 1 },
  { name: 'signature', maxCount: 1 },
  { name: 'transferCertificate', maxCount: 1 },
  { name: 'migrationCertificate', maxCount: 1 },
  { name: 'class8Marksheet', maxCount: 1 },
  { name: 'class9Marksheet', maxCount: 1 },
  { name: 'class10Marksheet', maxCount: 1 },
  { name: 'class11Marksheet', maxCount: 1 },
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};

    // Basic validation - SSMID is mandatory for all classes
    const required = ['studentName', 'fatherName', 'motherName', 'dob', 'medium', 'gender', 'phone', 'classApplied', 'residenceOfMP', 'ssmid'];
    for (const field of required) {
      if (!data[field] || !String(data[field]).trim()) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      }
    }

    // Bank validation for Class 10 and Class 12
    if (data.classApplied === '10' || data.classApplied === '12') {
      if (!data.bankAccountNumber || !String(data.bankAccountNumber).trim()) {
        return res.status(400).json({ success: false, message: 'Bank account number is required' });
      }
      if (!data.ifscCode || !String(data.ifscCode).trim()) {
        return res.status(400).json({ success: false, message: 'Bank IFSC code is required' });
      }
    }

    // Build documents array
    const documents = [];
    const docTypes = [
      'photograph', 'aadhar', 'samagra', 'signature',
      'transferCertificate', 'migrationCertificate',
      'class8Marksheet', 'class9Marksheet', 'class10Marksheet', 'class11Marksheet'
    ];
    for (const type of docTypes) {
      if (files[type] && files[type][0]) {
        const f = files[type][0];
        documents.push({
          type,
          originalName: f.originalname,
          storedName: f.filename,
          mimeType: f.mimetype,
          size: f.size,
        });
      }
    }

    // Class-specific required docs
    const classReqs = {
      '9': ['photograph', 'aadhar', 'samagra', 'signature', 'transferCertificate'],
      '10': ['photograph', 'aadhar', 'samagra', 'signature', 'transferCertificate'],
      '11': ['photograph', 'aadhar', 'samagra', 'signature', 'class10Marksheet', 'transferCertificate', 'migrationCertificate'],
      '12': ['photograph', 'aadhar', 'samagra', 'signature', 'class10Marksheet', 'transferCertificate', 'migrationCertificate'],
    };
    const uploadedTypes = documents.map(d => d.type);
    const missingDocs = (classReqs[data.classApplied] || []).filter(d => !uploadedTypes.includes(d));
    if (missingDocs.length > 0) {
      // Clean up uploaded files
      documents.forEach(d => {
        const fp = path.join(__dirname, '../../uploads', d.storedName);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
      return res.status(400).json({ success: false, message: `Missing required documents: ${missingDocs.join(', ')}` });
    }

    const applicationId = await generateAppId();

    const student = await Student.create({
      applicationId,
      classApplied: data.classApplied,
      studentName: data.studentName.trim(),
      fatherName: data.fatherName.trim(),
      motherName: data.motherName.trim(),
      dob: data.dob,
      dobWords: data.dobWords ? data.dobWords.trim() : undefined,
      medium: data.medium,
      gender: data.gender,
      phone: data.phone.trim(),
      residenceOfMP: data.residenceOfMP,
      address: {
        addressLine: data.addressLine || data.street || [data.houseNo, data.street].filter(Boolean).join(', '),
        houseNo: data.houseNo,
        street: data.street,
        city: data.city,
        district: data.district,
        state: data.state || 'Madhya Pradesh',
        pinCode: data.pinCode,
      },
      firstLanguage: data.firstLanguage,
      secondLanguage: data.secondLanguage,
      thirdLanguage: data.thirdLanguage,
      subject1: data.subject1,
      subject2: data.subject2,
      subject3: data.subject3,
      subject4: data.subject4,
      class8Details: { boardName: data.class8Board, rollNumber: data.class8Roll, percentage: data.class8Percentage },
      class9Details: { boardName: data.class9Board, rollNumber: data.class9Roll, percentage: data.class9Percentage },
      class10Details: { boardName: data.class10Board, rollNumber: data.class10Roll, percentage: data.class10Percentage },
      class11Details: { boardName: data.class11Board, rollNumber: data.class11Roll, percentage: data.class11Percentage },
      mpBoard: data.mpBoard,
      bankAccountNumber: data.bankAccountNumber,
      ifscCode: data.ifscCode,
      ssmid: data.ssmid,
      documents,
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      _id: student._id,
      applicationId: student.applicationId,
      studentName: student.studentName,
      classApplied: student.classApplied,
      submittedAt: student.submittedAt,
      student,
    });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit application. Please try again.' });
  }
});

// GET /api/students/:id - public single student board form lookup by ID or Application ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ applicationId: id });
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student application not found' });
    }
    res.json({ success: true, student });
  } catch (err) {
    console.error('Fetch public student error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch student record' });
  }
});

// GET /api/students/:id/pdf - public Student Board Form PDF download
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    let student = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ applicationId: id });
    }
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student application not found' });
    }

    const pdfService = require('../services/pdfService');
    const safeName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `BT_${new Date().getFullYear()}_${student.applicationId}_${safeName}_Class${student.classApplied}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateStudentPDF(student, res);
  } catch (err) {
    console.error('Public Student PDF error:', err);
    res.status(500).json({ success: false, message: 'PDF generation failed' });
  }
});

module.exports = router;
