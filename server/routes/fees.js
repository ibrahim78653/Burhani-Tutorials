const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const FeeReceipt = require('../models/FeeReceipt');
const auth = require('../middleware/auth');
const { numberToIndianWords } = require('../utils/numberToWords');
const { normalizeString, buildFeeReceiptQuery } = require('../utils/feeSearchHelper');
const { generateFeeReceiptPDFBuffer, generateAndSaveFeeReceiptPDF } = require('../services/feePdfService');

const router = express.Router();

// Ensure receipts directory exists inside uploads
const receiptsDir = path.join(__dirname, '../../uploads/receipts');
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

// All fee management routes require authenticated admin access
router.use(auth);

// ── 1. GET /api/admin/fees/next-number ──
// Auto-compute next sequential receipt number e.g. BT-000001
router.get('/next-number', async (req, res) => {
  try {
    const latestReceipt = await FeeReceipt.findOne({})
      .sort({ createdAt: -1, _id: -1 })
      .select('receiptNumber');

    let nextNumber = 1;
    if (latestReceipt && latestReceipt.receiptNumber) {
      const match = latestReceipt.receiptNumber.match(/BT-(\d+)/i);
      if (match && match[1]) {
        nextNumber = parseInt(match[1], 10) + 1;
      } else {
        const total = await FeeReceipt.countDocuments();
        nextNumber = total + 1;
      }
    }

    const padded = String(nextNumber).padStart(6, '0');
    const receiptNumber = `BT-${padded}`;

    res.json({ success: true, receiptNumber });
  } catch (err) {
    console.error('Error computing next receipt number:', err);
    res.status(500).json({ success: false, message: 'Failed to generate next receipt number' });
  }
});

// ── 2. GET /api/admin/fees/summary ──
// Live calculation of fee totals, using feeItems sub-documents for accurate per-type totals
router.get('/summary', async (req, res) => {
  try {
    const query = buildFeeReceiptQuery(req.query);

    // Aggregate across feeItems array to get per-type totals
    const [perTypeAgg, totalCount] = await Promise.all([
      FeeReceipt.aggregate([
        { $match: query },
        { $unwind: '$feeItems' },
        {
          $group: {
            _id: '$feeItems.feeType',
            total: { $sum: '$feeItems.amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      FeeReceipt.countDocuments(query),
    ]);

    let totalTuitionFees = 0;
    let tuitionItemsCount = 0;

    for (const row of perTypeAgg) {
      if (row._id === 'TUITION_FEE') {
        totalTuitionFees = row.total;
        tuitionItemsCount = row.count;
      }
    }

    const totalReceived = totalTuitionFees;

    res.json({
      success: true,
      summary: {
        totalTuitionFees,
        totalReceived,
        totalReceipts: totalCount,
        tuitionItemsCount,
      },
    });
  } catch (err) {
    console.error('Fee summary calculation error:', err);
    res.status(500).json({ success: false, message: 'Failed to calculate fee summary' });
  }
});

// ── 3. GET /api/admin/fees ──
// Search, filter, sort and paginate receipts
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = buildFeeReceiptQuery(req.query);

    const sort = {};
    const order = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'invoiceDate') sort.invoiceDate = order;
    else if (sortBy === 'amount') sort.amountPaid = order;
    else if (sortBy === 'receiptNumber') sort.receiptNumber = order;
    else if (sortBy === 'studentName') sort.studentName = order;
    else sort.createdAt = order;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [receipts, total] = await Promise.all([
      FeeReceipt.find(query).sort(sort).skip(skip).limit(limitNum),
      FeeReceipt.countDocuments(query),
    ]);

    res.json({
      success: true,
      receipts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (err) {
    console.error('Fetch fee receipts error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch fee receipts' });
  }
});

// ── 4. POST /api/admin/fees/generate ──
// Create & store fee receipt + server-side PDF (supports multiple fee items)
router.post('/generate', async (req, res) => {
  let createdPdfPath = null;
  try {
    const {
      feeItems,       // Array of { feeType, amount, description }
      studentName,
      classApplied,
      branch,
      invoiceDate,
      receiptNumber,
      paymentMode,
      remarks,
    } = req.body;

    // ── Validation ──
    if (!studentName || !studentName.trim()) {
      return res.status(400).json({ success: false, message: 'Student Name is required' });
    }
    if (!classApplied || !classApplied.trim()) {
      return res.status(400).json({ success: false, message: 'Class is required' });
    }
    if (!branch || !branch.trim()) {
      return res.status(400).json({ success: false, message: 'Branch is required' });
    }
    if (!invoiceDate || isNaN(new Date(invoiceDate).getTime())) {
      return res.status(400).json({ success: false, message: 'A valid Invoice Date is required' });
    }
    if (!receiptNumber || !receiptNumber.trim()) {
      return res.status(400).json({ success: false, message: 'Invoice / Receipt Number is required' });
    }
    if (!paymentMode || !['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'].includes(paymentMode)) {
      return res.status(400).json({ success: false, message: 'Valid Payment Mode is required' });
    }

    // Validate fee items
    if (!Array.isArray(feeItems) || feeItems.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one fee item is required' });
    }

    const validFeeTypes = ['TUITION_FEE'];
    const cleanFeeItems = [];
    let totalAmount = 0;

    for (let i = 0; i < feeItems.length; i++) {
      const item = feeItems[i];
      if (!item.feeType || !validFeeTypes.includes(item.feeType)) {
        return res.status(400).json({ success: false, message: `Fee item ${i + 1}: invalid fee type` });
      }
      const amt = parseFloat(item.amount);
      if (isNaN(amt) || amt <= 0) {
        return res.status(400).json({ success: false, message: `Fee item ${i + 1}: amount must be a positive number` });
      }
      cleanFeeItems.push({
        feeType: item.feeType,
        amount: amt,
        description: (item.description || '').trim(),
      });
      totalAmount += amt;
    }

    // Determine category
    let receiptCategory = 'TUITION_FEE';

    const cleanReceiptNumber = receiptNumber.trim().toUpperCase();

    // Check uniqueness
    const existing = await FeeReceipt.findOne({ receiptNumber: cleanReceiptNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Receipt number "${cleanReceiptNumber}" already exists. Please use a unique receipt number.`,
      });
    }

    const cleanStudentName = studentName.trim();
    const amountInWords = numberToIndianWords(totalAmount);
    const studentNameNormalized = normalizeString(cleanStudentName);

    // Prepare PDF filenames
    const safeStudent = cleanStudentName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const pdfFileName = `${cleanReceiptNumber}-${safeStudent}-Tuition-Fee.pdf`;
    const pdfStoredName = `receipt-${uuidv4()}.pdf`;
    createdPdfPath = path.join(receiptsDir, pdfStoredName);

    const receiptData = {
      receiptNumber: cleanReceiptNumber,
      feeItems: cleanFeeItems,
      receiptCategory,
      studentName: cleanStudentName,
      studentNameNormalized,
      classApplied: classApplied.trim(),
      branch: branch.trim(),
      invoiceDate: new Date(invoiceDate),
      amountPaid: totalAmount,
      amountInWords,
      paymentMode,
      remarks: (remarks || '').trim(),
      pdfFileName,
      pdfStoredName,
      createdBy: req.admin?.username || 'Admin',
    };

    // 1. Generate & save PDF to server disk
    await generateAndSaveFeeReceiptPDF(receiptData, createdPdfPath);

    // 2. Save database record
    const receipt = new FeeReceipt(receiptData);
    await receipt.save();

    res.status(201).json({
      success: true,
      message: 'Receipt generated and recorded successfully',
      receipt,
    });
  } catch (err) {
    console.error('Error generating fee receipt:', err);
    // Cleanup generated PDF if DB save failed
    if (createdPdfPath && fs.existsSync(createdPdfPath)) {
      try {
        fs.unlinkSync(createdPdfPath);
      } catch (cleanupErr) {
        console.error('Failed to cleanup dangling PDF:', cleanupErr);
      }
    }

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate receipt number. A receipt with this number already exists.',
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate receipt',
    });
  }
});

// ── 5. GET /api/admin/fees/:id ──
// Get single receipt details
router.get('/:id', async (req, res) => {
  try {
    const receipt = await FeeReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    }
    res.json({ success: true, receipt });
  } catch (err) {
    console.error('Fetch single receipt error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch receipt' });
  }
});

// ── 6. GET /api/admin/fees/:id/pdf ──
// Stream or download receipt PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const receipt = await FeeReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Fee receipt not found' });
    }

    const { download } = req.query;
    const filePath = path.join(receiptsDir, receipt.pdfStoredName);

    // If PDF file exists, stream it directly
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      const disposition = download === '1' ? 'attachment' : 'inline';
      res.setHeader('Content-Disposition', `${disposition}; filename="${receipt.pdfFileName}"`);
      return res.sendFile(filePath);
    }

    // If file was missing from storage, re-generate dynamically
    const buffer = await generateFeeReceiptPDFBuffer(receipt);
    fs.writeFileSync(filePath, buffer);

    res.setHeader('Content-Type', 'application/pdf');
    const disposition = download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Disposition', `${disposition}; filename="${receipt.pdfFileName}"`);
    return res.end(buffer);
  } catch (err) {
    console.error('Serve receipt PDF error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve receipt PDF' });
  }
});

// ── 7. DELETE /api/admin/fees/:id ──
// Permanently delete a receipt (DB record + stored PDF file)
router.delete('/:id', async (req, res) => {
  try {
    const receipt = await FeeReceipt.findById(req.params.id);
    if (!receipt) {
      return res.status(404).json({ success: false, message: 'Receipt not found or already deleted' });
    }

    const { receiptNumber, studentName, amountPaid, receiptCategory, pdfStoredName } = receipt;

    // 1. Delete DB record permanently
    await FeeReceipt.findByIdAndDelete(req.params.id);

    // 2. Delete stored PDF file from filesystem
    if (pdfStoredName) {
      const filePath = path.join(receiptsDir, pdfStoredName);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (fileErr) {
          console.error('Failed to unlink PDF file on delete:', fileErr);
        }
      }
    }

    // 3. Security audit logging
    const adminUser = req.admin?.username || 'Admin';
    console.log(`[AUDIT] Permanent Receipt Deletion: Receipt ${receiptNumber} (Student: ${studentName}, Amount: ₹${amountPaid}, Category: ${receiptCategory}) permanently deleted by ${adminUser} at ${new Date().toISOString()}`);

    res.json({
      success: true,
      message: `Receipt ${receiptNumber} permanently deleted`,
      deletedReceipt: {
        receiptNumber,
        studentName,
        amountPaid,
      },
    });
  } catch (err) {
    console.error('Permanent delete receipt error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete receipt' });
  }
});

module.exports = router;
