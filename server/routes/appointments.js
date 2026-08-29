const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');

const WHATSAPP_TARGET_NUMBER = '918319651437';

// Generate unique appointment ID: BT-APT-YYYY-XXXXX
async function generateAppointmentId() {
  const year = new Date().getFullYear();
  const count = await Appointment.countDocuments();
  const sequence = String(count + 1001).padStart(4, '0');
  return `BT-APT-${year}-${sequence}`;
}

// POST /api/appointments - Submit new appointment request
router.post('/', async (req, res) => {
  try {
    const {
      studentName,
      parentName,
      classApplied,
      stream,
      phone,
      branch,
      preferredDate,
      message,
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

    const appointmentId = await generateAppointmentId();

    const newAppointment = new Appointment({
      appointmentId,
      studentName: studentName.trim(),
      parentName: parentName.trim(),
      classApplied: String(classApplied),
      stream: (['11', '12'].includes(String(classApplied)) && stream) ? stream : '',
      phone: cleanPhone,
      branch,
      preferredDate: preferredDate ? String(preferredDate).trim() : '',
      message: message ? String(message).trim() : '',
      status: 'New',
    });

    await newAppointment.save();

    // Format WhatsApp message text
    const dateStr = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const streamLine = newAppointment.stream ? `\nStream: ${newAppointment.stream}` : '';
    const dateLine = newAppointment.preferredDate ? `\nPreferred Date: ${newAppointment.preferredDate}` : '';

    const whatsappMessage = `New Burhani Tutorials Appointment\nStudent Name: ${newAppointment.studentName}\nParent Name: ${newAppointment.parentName}\nClass: ${newAppointment.classApplied}th${streamLine}\nPhone: ${newAppointment.phone}\nBranch: ${newAppointment.branch}${dateLine}\nAppointment ID: ${newAppointment.appointmentId}\nSubmitted At: ${dateStr}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_TARGET_NUMBER}?text=${encodeURIComponent(whatsappMessage)}`;

    res.status(201).json({
      success: true,
      message: 'Your appointment request has been submitted successfully!',
      appointment: {
        id: newAppointment._id,
        appointmentId: newAppointment.appointmentId,
        studentName: newAppointment.studentName,
        parentName: newAppointment.parentName,
        classApplied: newAppointment.classApplied,
        stream: newAppointment.stream,
        phone: newAppointment.phone,
        branch: newAppointment.branch,
        createdAt: newAppointment.createdAt,
      },
      whatsapp: {
        targetNumber: '8319651437',
        message: whatsappMessage,
        url: whatsappUrl,
      },
    });
  } catch (err) {
    console.error('Appointment submission error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit appointment request. Please try again.',
    });
  }
});

module.exports = router;
