const express = require('express');
const router = express.Router();
const FreeSession = require('../models/FreeSession');

const WHATSAPP_TARGET_NUMBER = '918319651437';

// Generate unique request ID: BT-FS-YYYY-XXXXX
async function generateRequestId() {
  const year = new Date().getFullYear();
  const count = await FreeSession.countDocuments();
  const sequence = String(count + 1001).padStart(4, '0');
  return `BT-FS-${year}-${sequence}`;
}

// POST /api/free-sessions - Submit 2-Day free session request
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      parentName,
      classApplied,
      phone,
      branch,
      notes,
    } = req.body;

    // Basic validation
    if (!studentName || !parentName || !classApplied || !phone || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (Student Name, Parent Name, Class, Phone, and Branch).',
      });
    }

    const cleanPhone = String(phone).trim().replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit Indian mobile number.',
      });
    }

    const validBranches = ['Noorani Nagar', 'Saify Nagar', 'Masakin-E-Saifiya'];
    if (!validBranches.includes(branch)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch selected.',
      });
    }

    const validClasses = ['5', '6', '7', '8', '9', '10', '11', '12'];
    if (!validClasses.includes(String(classApplied))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid class selected.',
      });
    }

    const requestId = await generateRequestId();

    const newRequest = new FreeSession({
      requestId,
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      classApplied: String(classApplied),
      phone: cleanPhone,
      branch,
      notes: notes ? String(notes).trim() : '',
      status: 'New',
    });

    await newRequest.save();

    // Format WhatsApp message text
    const dateStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const whatsappMessage = `New 2-Day Free Session Request\nStudent Name: ${newRequest.studentName}\nParent Name: ${newRequest.parentName}\nClass: ${newRequest.classApplied}th\nPhone: ${newRequest.phone}\nBranch: ${newRequest.branch}\nRequest ID: ${newRequest.requestId}\nSubmitted At: ${dateStr}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_TARGET_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({
      success: true,
      message: 'Your 2-Day Free Session request has been submitted successfully!',
      request: {
        id: newRequest._id,
        requestId: newRequest.requestId,
        studentName: newRequest.studentName,
        parentName: newRequest.parentName,
        classApplied: newRequest.classApplied,
        phone: newRequest.phone,
        branch: newRequest.branch,
        createdAt: newRequest.createdAt,
      },
      whatsapp: {
        targetNumber: '8319651437',
        message: whatsappMessage,
        url: whatsappUrl,
      },
    });
  } catch (err) {
    console.error('Free session submission error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit 2-Day free session request. Please try again.',
    });
  }
});

module.exports = router;
