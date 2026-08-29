const express = require('express');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const Admission = require('../models/Admission');
const Appointment = require('../models/Appointment');
const FreeSession = require('../models/FreeSession');
const auth = require('../middleware/auth');
const pdfService = require('../services/pdfService');
const router = express.Router();

// All admin routes are protected
router.use(auth);

// GET /api/admin/stats - combined statistics for Board, Admission, Appointments & Free Sessions
router.get('/stats', async (req, res) => {
  try {
    const [
      total, class9, class10, class11, class12, recent,
      admissionsTotal, admClass5, admClass6, admClass7, admClass8, admClass9, admClass10, admClass11, admClass12, recentAdmissions,
      appointmentsTotal, appointmentsNew, recentAppointments,
      freeSessionsTotal, freeSessionsNew, recentFreeSessions,
    ] = await Promise.all([
      // Board Form counts
      Student.countDocuments({ isArchived: false }),
      Student.countDocuments({ classApplied: '9', isArchived: false }),
      Student.countDocuments({ classApplied: '10', isArchived: false }),
      Student.countDocuments({ classApplied: '11', isArchived: false }),
      Student.countDocuments({ classApplied: '12', isArchived: false }),
      Student.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5).select('applicationId studentName classApplied createdAt status'),

      // Admission Form counts
      Admission.countDocuments({ isArchived: false }),
      Admission.countDocuments({ classApplied: '5', isArchived: false }),
      Admission.countDocuments({ classApplied: '6', isArchived: false }),
      Admission.countDocuments({ classApplied: '7', isArchived: false }),
      Admission.countDocuments({ classApplied: '8', isArchived: false }),
      Admission.countDocuments({ classApplied: '9', isArchived: false }),
      Admission.countDocuments({ classApplied: '10', isArchived: false }),
      Admission.countDocuments({ classApplied: '11', isArchived: false }),
      Admission.countDocuments({ classApplied: '12', isArchived: false }),
      Admission.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5).select('applicationId studentName classApplied schoolName createdAt status'),

      // Appointment counts
      Appointment.countDocuments({ isArchived: false }),
      Appointment.countDocuments({ isArchived: false, status: 'New' }),
      Appointment.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5).select('appointmentId studentName parentName classApplied stream branch phone status createdAt'),

      // Free Session counts
      FreeSession.countDocuments({ isArchived: false }),
      FreeSession.countDocuments({ isArchived: false, status: 'New' }),
      FreeSession.find({ isArchived: false }).sort({ createdAt: -1 }).limit(5).select('requestId studentName parentName classApplied branch phone status createdAt'),
    ]);

    res.json({
      success: true,
      stats: {
        total,
        class9,
        class10,
        class11,
        class12,
        admissionsTotal,
        admClass5,
        admClass6,
        admClass7,
        admClass8,
        admClass9,
        admClass10,
        admClass11,
        admClass12,
        appointmentsTotal,
        appointmentsNew,
        freeSessionsTotal,
        freeSessionsNew,
      },
      recent,
      recentAdmissions,
      recentAppointments,
      recentFreeSessions,
    });
  } catch (err) {
    console.error('Stats fetch error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/admin/students - list with search, filter, pagination, sort
router.get('/students', async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search = '', classFilter = '', medium = '', gender = '',
      residenceOfMP = '', mpBoard = '',
      sortBy = 'createdAt', sortOrder = 'desc',
      dateFrom, dateTo,
    } = req.query;

    const query = { isArchived: false };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (classFilter) query.classApplied = classFilter;
    if (medium) query.medium = medium;
    if (gender) query.gender = gender;
    if (residenceOfMP) query.residenceOfMP = residenceOfMP;
    if (mpBoard) query.mpBoard = mpBoard;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip(skip).limit(parseInt(limit))
        .select('applicationId studentName fatherName classApplied medium gender phone status createdAt residenceOfMP'),
      Student.countDocuments(query),
    ]);

    res.json({
      success: true,
      students,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch students' });
  }
});

// GET /api/admin/students/:id
router.get('/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    // Mask bank account
    const data = student.toObject();
    if (data.bankAccountNumber) {
      data.bankAccountNumber = '****' + data.bankAccountNumber.slice(-4);
    }
    res.json({ success: true, student: data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch student' });
  }
});

// PATCH /api/admin/students/:id
router.patch('/students/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.applicationId; // protect app ID
    delete updates.documents;     // don't allow bulk doc update here
    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update student' });
  }
});

// DELETE /api/admin/students/:id - archive
router.delete('/students/:id', async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: 'Student archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to archive student' });
  }
});

// GET /api/admin/documents/:storedName - serve document (admin only, inline preview or downloadable)
router.get('/documents/:storedName', async (req, res) => {
  try {
    const { storedName } = req.params;
    const { download } = req.query;

    // Sanitize filename - only alphanumeric, dash, dot
    if (!/^[a-zA-Z0-9\-_.]+$/.test(storedName)) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../../uploads', storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document not found or removed' });
    }

    const ext = path.extname(storedName).toLowerCase();
    const mimeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    const mimeType = mimeMap[ext] || 'application/octet-stream';

    if (download === '1') {
      return res.download(filePath, storedName);
    }

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Document serve error:', err);
    res.status(500).json({ success: false, message: 'Failed to serve document' });
  }
});

// GET /api/admin/students/:id/pdf - individual PDF
router.get('/students/:id/pdf', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    const safeName = student.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `BT_${new Date().getFullYear()}_${student.applicationId}_${safeName}_Class${student.classApplied}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateStudentPDF(student, res);
  } catch (err) {
    console.error('PDF error:', err);
    res.status(500).json({ success: false, message: 'PDF generation failed' });
  }
});

// POST /api/admin/bulk-pdf - bulk PDF for board form students
router.post('/bulk-pdf', async (req, res) => {
  try {
    const { classFilter, dateFrom, dateTo, studentIds } = req.body;
    const query = { isArchived: false };
    if (studentIds && studentIds.length > 0) {
      query._id = { $in: studentIds };
    } else {
      if (classFilter) query.classApplied = classFilter;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
      }
    }
    const students = await Student.find(query).sort({ createdAt: -1 });
    if (students.length === 0) return res.status(404).json({ success: false, message: 'No students found' });

    const classLabel = classFilter ? `Class${classFilter}` : 'AllClasses';
    const filename = `Burhani_Tutorials_Students_${classLabel}_${new Date().getFullYear()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateBulkPDF(students, res);
  } catch (err) {
    console.error('Bulk PDF error:', err);
    res.status(500).json({ success: false, message: 'Bulk PDF generation failed' });
  }
});

// ── ADMISSION FORM ADMIN ENDPOINTS ──

// GET /api/admin/admissions - list with search, filter, pagination, sort
router.get('/admissions', async (req, res) => {
  try {
    const {
      page = 1, limit = 20,
      search = '', classFilter = '', status = '',
      sortBy = 'createdAt', sortOrder = 'desc',
      dateFrom, dateTo,
    } = req.query;

    const query = { isArchived: false };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { motherName: { $regex: search, $options: 'i' } },
        { applicationId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { schoolName: { $regex: search, $options: 'i' } },
      ];
    }
    if (classFilter) query.classApplied = classFilter;
    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [admissions, total] = await Promise.all([
      Admission.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Admission.countDocuments(query),
    ]);

    res.json({
      success: true,
      admissions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Fetch admissions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admission applications' });
  }
});

// GET /api/admin/admissions/:id - single admission application
router.get('/admissions/:id', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission application not found' });
    res.json({ success: true, admission });
  } catch (err) {
    console.error('Fetch single admission error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admission details' });
  }
});

// PATCH /api/admin/admissions/:id - update admission details or status
router.patch('/admissions/:id', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.applicationId; // protect ID
    delete updates.documents;

    const admission = await Admission.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!admission) return res.status(404).json({ success: false, message: 'Admission application not found' });
    res.json({ success: true, admission });
  } catch (err) {
    console.error('Update admission error:', err);
    res.status(500).json({ success: false, message: 'Failed to update admission' });
  }
});

// DELETE /api/admin/admissions/:id - archive admission application
router.delete('/admissions/:id', async (req, res) => {
  try {
    await Admission.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: 'Admission application archived' });
  } catch (err) {
    console.error('Archive admission error:', err);
    res.status(500).json({ success: false, message: 'Failed to archive admission' });
  }
});

// GET /api/admin/admissions/:id/pdf - individual Admission PDF
router.get('/admissions/:id/pdf', async (req, res) => {
  try {
    const admission = await Admission.findById(req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Admission application not found' });
    const safeName = admission.studentName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Burhani_Admission_${admission.applicationId}_${safeName}_Class${admission.classApplied}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateAdmissionPDF(admission, res);
  } catch (err) {
    console.error('Admission PDF error:', err);
    res.status(500).json({ success: false, message: 'Admission PDF generation failed' });
  }
});

// POST /api/admin/bulk-admission-pdf - bulk Admission PDF
router.post('/bulk-admission-pdf', async (req, res) => {
  try {
    const { classFilter, dateFrom, dateTo, admissionIds } = req.body;
    const query = { isArchived: false };
    if (admissionIds && admissionIds.length > 0) {
      query._id = { $in: admissionIds };
    } else {
      if (classFilter) query.classApplied = classFilter;
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
      }
    }
    const admissions = await Admission.find(query).sort({ createdAt: -1 });
    if (admissions.length === 0) return res.status(404).json({ success: false, message: 'No admission applications found' });

    const classLabel = classFilter ? `Class${classFilter}` : 'AllClasses';
    const filename = `Burhani_Tutorials_Admissions_${classLabel}_${new Date().getFullYear()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await pdfService.generateBulkAdmissionPDF(admissions, res);
  } catch (err) {
    console.error('Bulk Admission PDF error:', err);
    res.status(500).json({ success: false, message: 'Bulk Admission PDF generation failed' });
  }
});

// ── APPOINTMENT LOGS ADMIN ENDPOINTS ──

// GET /api/admin/appointments - list with search, filter, pagination, sort
router.get('/appointments', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      branch = '',
      status = '',
      classFilter = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = req.query;

    const query = { isArchived: false };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { appointmentId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) query.branch = branch;
    if (status) query.status = status;
    if (classFilter) query.classApplied = classFilter;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [appointments, total] = await Promise.all([
      Appointment.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Appointment.countDocuments(query),
    ]);

    res.json({
      success: true,
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch appointments' });
  }
});

// GET /api/admin/appointments/:id
router.get('/appointments/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch appointment' });
  }
});

// PATCH /api/admin/appointments/:id - update status or notes
router.patch('/appointments/:id', async (req, res) => {
  try {
    const { status, adminNotes, preferredDate, branch } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (preferredDate !== undefined) updates.preferredDate = preferredDate;
    if (branch) updates.branch = branch;

    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update appointment' });
  }
});

// DELETE /api/admin/appointments/:id - archive
router.delete('/appointments/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: 'Appointment archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to archive appointment' });
  }
});

// ── FREE SESSION REQUESTS ADMIN ENDPOINTS ──

// GET /api/admin/free-sessions - list with search, filter, pagination, sort
router.get('/free-sessions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      branch = '',
      status = '',
      classFilter = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = req.query;

    const query = { isArchived: false };

    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } },
        { requestId: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (branch) query.branch = branch;
    if (status) query.status = status;
    if (classFilter) query.classApplied = classFilter;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(new Date(dateTo).setHours(23, 59, 59));
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [freeSessions, total] = await Promise.all([
      FreeSession.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      FreeSession.countDocuments(query),
    ]);

    res.json({
      success: true,
      freeSessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('Fetch free sessions error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch free session requests' });
  }
});

// GET /api/admin/free-sessions/:id
router.get('/free-sessions/:id', async (req, res) => {
  try {
    const session = await FreeSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Free session request not found' });
    res.json({ success: true, freeSession: session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch free session request' });
  }
});

// PATCH /api/admin/free-sessions/:id - update status or notes
router.patch('/free-sessions/:id', async (req, res) => {
  try {
    const { status, adminNotes, branch } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (branch) updates.branch = branch;

    const session = await FreeSession.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!session) return res.status(404).json({ success: false, message: 'Free session request not found' });
    res.json({ success: true, freeSession: session });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update free session request' });
  }
});

// DELETE /api/admin/free-sessions/:id - archive
router.delete('/free-sessions/:id', async (req, res) => {
  try {
    await FreeSession.findByIdAndUpdate(req.params.id, { isArchived: true });
    res.json({ success: true, message: 'Free session request archived' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to archive free session request' });
  }
});

module.exports = router;
