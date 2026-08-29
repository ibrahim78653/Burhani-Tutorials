require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const adminRoutes = require('./routes/admin');
const admissionRoutes = require('./routes/admissions');
const appointmentRoutes = require('./routes/appointments');
const freeSessionRoutes = require('./routes/freeSessions');

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Security & middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/free-sessions', freeSessionRoutes);
app.use('/api/admin', adminRoutes);

// Public document server for preview and attachments
app.get('/api/documents/:storedName', (req, res) => {
  try {
    const { storedName } = req.params;
    const { download } = req.query;

    if (!/^[a-zA-Z0-9\-_.]+$/.test(storedName)) {
      return res.status(400).json({ success: false, message: 'Invalid filename' });
    }

    const filePath = path.join(__dirname, '../uploads', storedName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Document not found' });
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
    res.setHeader('Cache-Control', 'public, max-age=3600');
    return res.sendFile(filePath);
  } catch (err) {
    console.error('Document serve error:', err);
    res.status(500).json({ success: false, message: 'Failed to serve document' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File size must not exceed 1 MB.',
    });
  }
  console.error(err.stack || err.message);
  res.status(err.status || 400).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Connect DB then start
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    require('./scripts/seedAdmin')();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
