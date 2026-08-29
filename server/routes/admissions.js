const express = require('express');
const path = require('path');
const fs = require('fs');
const Admission = require('../models/Admission');
const upload = require('../middleware/upload');
const router = express.Router();

// Generate Application ID for admissions: ADM-2026-XXXXXX
async function generateAdmissionAppId() {
  const year = new Date().getFullYear();
  const count = await Admission.countDocuments();
  const num = String(count + 1).padStart(6, '0');
  return `ADM-${year}-${num}`;
}

// POST /api/admissions - submit admission form (multipart)
router.post('/', upload.fields([
  { name: 'photograph', maxCount: 1 },
  { name: 'aadhar', maxCount: 1 },
  { name: 'parentSignature', maxCount: 1 },
]), async (req, res) => {
  try {
    const data = req.body;
    const files = req.files || {};

    // Validate required fields
    const requiredFields = [
      'studentName',
      'fatherName',
      'motherName',
      'phone',
      'dob',
      'classApplied',
      'schoolName',
      'address',
      'branch',
    ];

    for (const field of requiredFields) {
      if (!data[field] || !String(data[field]).trim()) {
        return res.status(400).json({ success: false, message: `${field} is required` });
      }
    }

    // Validate branch
    const validBranches = ['Noorani Nagar', 'Saify Nagar', 'Masakin-E-Saifiya'];
    if (!validBranches.includes(String(data.branch).trim())) {
      return res.status(400).json({ success: false, message: 'Please select a valid Branch (Noorani Nagar, Saify Nagar, or Masakin-E-Saifiya)' });
    }

    // Validate class is between 5 and 12
    const validClasses = ['5', '6', '7', '8', '9', '10', '11', '12'];
    if (!validClasses.includes(String(data.classApplied).trim())) {
      return res.status(400).json({ success: false, message: 'Class must be between 5 and 12' });
    }

    // Build documents array (photograph + aadhar only; signature collected physically)
    const documents = [];
    const docTypes = ['photograph', 'aadhar', 'parentSignature'];
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

    // Only photograph and aadhar are mandatory
    const mandatoryDocs = ['photograph', 'aadhar'];
    const uploadedTypes = documents.map(d => d.type);
    const missingDocs = mandatoryDocs.filter(d => !uploadedTypes.includes(d));
    if (missingDocs.length > 0) {
      // Clean up newly uploaded files on failure
      documents.forEach(d => {
        const fp = path.join(__dirname, '../../uploads', d.storedName);
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
      const readableNames = {
        photograph: 'Photograph',
        aadhar: 'Aadhar Card',
      };
      const missingLabels = missingDocs.map(m => readableNames[m] || m);
      return res.status(400).json({
        success: false,
        message: `Missing required documents: ${missingLabels.join(', ')}`,
      });
    }

    const applicationId = await generateAdmissionAppId();

    const admission = await Admission.create({
      applicationId,
      studentName: data.studentName.trim(),
      fatherName: data.fatherName.trim(),
      motherName: data.motherName.trim(),
      phone: data.phone.trim(),
      dob: data.dob,
      classApplied: String(data.classApplied).trim(),
      schoolName: data.schoolName.trim(),
      address: data.address.trim(),
      branch: data.branch.trim(),
      documents,
    });

    res.status(201).json({
      success: true,
      message: 'Admission form submitted successfully',
      _id: admission._id,
      applicationId: admission.applicationId,
      studentName: admission.studentName,
      classApplied: admission.classApplied,
      submittedAt: admission.submittedAt,
      admission,
    });
  } catch (err) {
    console.error('Admission submission error:', err);
    res.status(500).json({ success: false, message: err.message || 'Submission failed' });
  }
});

// GET /api/admissions/:id - public single admission lookup by ID or Application ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let admission = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      admission = await Admission.findById(id);
    }
    if (!admission) {
      admission = await Admission.findOne({ applicationId: id });
    }
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission application not found' });
    }
    res.json({ success: true, admission });
  } catch (err) {
    console.error('Fetch public admission error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admission' });
  }
});

// GET /api/admissions/:id/pdf - public Admission PDF download
router.get('/:id/pdf', async (req, res) => {
  try {
    const { id } = req.params;
    let admission = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      admission = await Admission.findById(id);
    }
    if (!admission) {
      admission = await Admission.findOne({ applicationId: id });
    }
    if (!admission) {
      return res.status(404).json({ success: false, message: 'Admission application not found' });
    }

    const pdfService = require('../services/pdfService');
    const safeName = admission.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Burhani_Admission_${admission.applicationId}_${safeName}_Class${admission.classApplied}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateAdmissionPDF(admission, res);
  } catch (err) {
    console.error('Public Admission PDF error:', err);
    res.status(500).json({ success: false, message: 'Admission PDF generation failed' });
  }
});

module.exports = router;
