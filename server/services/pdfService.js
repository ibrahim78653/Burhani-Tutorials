const PDFDocument = require('pdfkit');
const { PDFDocument: PDFLibDoc } = require('pdf-lib');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../uploads');
const COLORS = {
  primary: '#1a3557',
  primaryDark: '#0f2238',
  accent: '#c8a96e',
  text: '#222222',
  muted: '#666666',
  line: '#dddddd',
  light: '#f5f7fa',
};

function getDocInfo(student, type) {
  const doc = (student.documents || []).find(d => d.type === type);
  if (!doc) return null;
  const filePath = path.join(uploadsDir, doc.storedName);
  if (!fs.existsSync(filePath)) return null;
  return { ...doc.toObject ? doc.toObject() : doc, filePath };
}

function getInstituteLogoPath() {
  const possiblePaths = [
    path.join(__dirname, '../../BT logo.jpeg'),
    path.join(__dirname, '../../client/public/bt-logo.jpeg'),
    path.join(__dirname, '../BT logo.jpeg'),
  ];
  return possiblePaths.find(p => fs.existsSync(p)) || null;
}

function drawHeader(doc, student) {
  const pageWidth = doc.page.width;
  const headerH = 96;
  const subBannerH = 26;

  // Header background
  doc.rect(0, 0, pageWidth, headerH).fill(COLORS.primary);

  // 1. LEFT TOP CORNER — Institute Logo
  const logoW = 72;
  const logoH = 72;
  const logoX = 30;
  const logoY = 12;

  doc.rect(logoX, logoY, logoW, logoH).fillAndStroke('#ffffff', COLORS.accent);
  const logoPath = getInstituteLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, logoX + 3, logoY + 3, { fit: [logoW - 6, logoH - 6], align: 'center', valign: 'center' });
    } catch (e) {
      doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
        .text('BURHANI\nTUTORIALS', logoX, logoY + 26, { width: logoW, align: 'center' });
    }
  } else {
    doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
      .text('BURHANI\nTUTORIALS', logoX, logoY + 26, { width: logoW, align: 'center' });
  }

  // 2. RIGHT TOP CORNER — Student Photograph
  const photoW = 66;
  const photoH = 76;
  const photoX = pageWidth - 30 - photoW;
  const photoY = 10;

  doc.rect(photoX, photoY, photoW, photoH).fillAndStroke('#ffffff', COLORS.accent);
  const photoDoc = getDocInfo(student, 'photograph');
  if (photoDoc && fs.existsSync(photoDoc.filePath)) {
    try {
      doc.image(photoDoc.filePath, photoX + 2, photoY + 2, { fit: [photoW - 4, photoH - 4], align: 'center', valign: 'center' });
    } catch (e) {
      doc.fillColor(COLORS.muted).fontSize(7.5).font('Helvetica')
        .text('STUDENT\nPHOTO', photoX, photoY + 28, { width: photoW, align: 'center' });
    }
  } else {
    doc.fillColor(COLORS.muted).fontSize(7.5).font('Helvetica')
      .text('STUDENT\nPHOTO', photoX, photoY + 28, { width: photoW, align: 'center' });
  }

  // 3. CENTER TEXT — Title & Institute Details
  const centerX = logoX + logoW + 8;
  const centerW = photoX - centerX - 8;

  doc.fillColor('#ffffff').fontSize(19).font('Helvetica-Bold')
    .text('BURHANI TUTORIALS', centerX, 16, { width: centerW, align: 'center' });
  doc.fillColor(COLORS.accent).fontSize(9.5).font('Helvetica-Bold')
    .text('Student Board Form — 30+ Years of Excellence', centerX, 40, { width: centerW, align: 'center' });
  doc.fillColor('#cbd5e1').fontSize(8).font('Helvetica')
    .text('An Institute of Science & Commerce  •  Indore (M.P.)', centerX, 56, { width: centerW, align: 'center' });
  doc.fillColor('#ffffff').fontSize(7.5).font('Helvetica')
    .text('📞 9827252114, 9301262721   |   ✉️ burhanitutorials1@gmail.com', centerX, 70, { width: centerW, align: 'center' });

  // 4. APPLICATION INFO BAR (Gold)
  doc.rect(0, headerH, pageWidth, subBannerH).fill(COLORS.accent);
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold')
    .text(`Application ID: ${student.applicationId}`, 30, headerH + 7)
    .text(`Class: ${student.classApplied}th`, 270, headerH + 7);
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold')
    .text(`Date: ${new Date(student.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 0, headerH + 7, { width: pageWidth - 30, align: 'right' });
}

function drawDocumentPageHeader(doc, student, docTitle) {
  const pageWidth = doc.page.width;
  // Header background
  doc.rect(0, 0, pageWidth, 75).fill(COLORS.primary);

  // Title
  doc.fillColor('#ffffff').fontSize(17).font('Helvetica-Bold')
    .text('BURHANI TUTORIALS', 40, 15, { align: 'center' });
  doc.fontSize(9.5).font('Helvetica')
    .text('Student Document Verification Attachment', 40, 38, { align: 'center' });

  // Document Info Bar
  doc.rect(0, 75, pageWidth, 28).fill(COLORS.accent);
  doc.fillColor('#ffffff').fontSize(9.5).font('Helvetica-Bold')
    .text(`ATTACHED DOCUMENT: ${docTitle.toUpperCase()}`, 40, 83)
    .text(`ID: ${student.applicationId} | ${student.studentName} (Class ${student.classApplied}th)`, 260, 83, { width: pageWidth - 300, align: 'right' });
}

function drawSectionTitle(doc, title, y) {
  doc.rect(40, y, doc.page.width - 80, 22).fill(COLORS.light);
  doc.rect(40, y, 4, 22).fill(COLORS.accent);
  doc.fillColor(COLORS.primary).fontSize(10).font('Helvetica-Bold')
    .text(title, 52, y + 6);
  return y + 30;
}

function drawField(doc, label, value, x, y, labelWidth = 130) {
  doc.fillColor(COLORS.muted).fontSize(8.5).font('Helvetica')
    .text(label + ':', x, y, { width: labelWidth });
  doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Bold')
    .text(value || '—', x + labelWidth, y, { width: 160 });
}

function drawTwoColumns(doc, fields, startY) {
  let y = startY;
  const col1X = 40, col2X = 310;
  for (let i = 0; i < fields.length; i += 2) {
    drawField(doc, fields[i][0], fields[i][1], col1X, y);
    if (fields[i + 1]) drawField(doc, fields[i + 1][0], fields[i + 1][1], col2X, y);
    y += 18;
  }
  return y + 6;
}

// Render Page 1 (Board Form) for a student onto doc
function renderStudentFormPage(doc, student) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  drawHeader(doc, student);
  let y = 132;

  // ── PERSONAL DETAILS ──
  y = drawSectionTitle(doc, 'PERSONAL DETAILS', y);
  y = drawTwoColumns(doc, [
    ['Student Name', student.studentName],
    ['Father\'s Name', student.fatherName],
    ['Mother\'s Name', student.motherName],
    ['Date of Birth', student.dob],
    ['Gender', student.gender],
    ['Medium', student.medium],
    ['Phone Number', student.phone],
    ['SSMID (Samagra ID)', student.ssmid],
    ['Residence of MP', student.residenceOfMP],
  ], y);

  // ── ADDRESS ──
  y = drawSectionTitle(doc, 'ADDRESS', y);
  const addr = student.address || {};
  const addressLine = addr.addressLine || [addr.houseNo, addr.street].filter(Boolean).join(', ');
  y = drawTwoColumns(doc, [
    ['Address', addressLine],
    ['City', addr.city],
    ['State', addr.state || 'Madhya Pradesh'],
    ['PIN Code', addr.pinCode],
  ], y);

  // ── LANGUAGES / SUBJECTS ──
  const cls = student.classApplied;
  if (['9', '10'].includes(cls)) {
    y = drawSectionTitle(doc, 'LANGUAGE DETAILS', y);
    y = drawTwoColumns(doc, [
      ['1st Language', student.firstLanguage],
      ['2nd Language', student.secondLanguage],
      ['3rd Language', student.thirdLanguage],
    ], y);
  } else if (['11', '12'].includes(cls)) {
    y = drawSectionTitle(doc, 'LANGUAGE & SUBJECTS', y);
    y = drawTwoColumns(doc, [
      ['1st Language', student.firstLanguage],
      ['2nd Language', student.secondLanguage],
      ['1st Subject', student.subject1],
      ['2nd Subject', student.subject2],
      ['3rd Subject', student.subject3],
      ['4th Subject (Opt.)', student.subject4 || '—'],
    ], y);
  }

  // ── ACADEMIC DETAILS ──
  y = drawSectionTitle(doc, 'ACADEMIC DETAILS', y);
  const drawAcadRow = (label, details, yPos) => {
    if (!details || (!details.boardName && !details.rollNumber && !details.percentage)) return yPos;
    doc.fillColor(COLORS.muted).fontSize(8.5).font('Helvetica-Bold').text(label, 40, yPos);
    yPos += 14;
    const fields = [
      ['Board Name', details.boardName],
      ['Roll Number', details.rollNumber],
      ['Result / %', details.percentage ? `${details.percentage}%` : '—'],
    ];
    yPos = drawTwoColumns(doc, fields, yPos);
    return yPos;
  };

  if (cls === '12') {
    y = drawAcadRow('Class 11 Details', student.class11Details, y);
  } else {
    y = drawAcadRow('Class 8 Details', student.class8Details, y);
  }
  if (['10', '11', '12'].includes(cls)) y = drawAcadRow('Class 9 Details', student.class9Details, y);
  if (['11', '12'].includes(cls)) y = drawAcadRow('Class 10 Details', student.class10Details, y);

  if (['11', '12'].includes(cls) && student.mpBoard) {
    y = drawTwoColumns(doc, [['MP Board', student.mpBoard]], y);
  }

  // ── BANK DETAILS (Class 10 & 12) ──
  if (['10', '12'].includes(cls)) {
    y = drawSectionTitle(doc, 'BANK DETAILS', y);
    y = drawTwoColumns(doc, [
      ['Account No.', student.bankAccountNumber ? '****' + String(student.bankAccountNumber).slice(-4) : '—'],
      ['IFSC Code', student.ifscCode],
    ], y);
  }

  // ── DOCUMENTS CHECKLIST ──
  y = drawSectionTitle(doc, 'DOCUMENTS SUBMITTED', y);
  const docLabels = {
    photograph: 'Photograph',
    aadhar: 'Aadhar Card',
    samagra: 'Samagra ID / SSMID',
    signature: 'Student Signature',
    transferCertificate: 'Transfer Certificate (TC)',
    migrationCertificate: 'Migration Certificate',
    class8Marksheet: 'Class 8 Marksheet',
    class9Marksheet: 'Class 9 Marksheet',
    class10Marksheet: 'Class 10 Marksheet',
    class11Marksheet: 'Class 11 Marksheet',
  };
  const uploadedTypes = (student.documents || []).map(d => d.type);
  const docsToShow = Object.entries(docLabels).filter(([type]) => {
    if (type === 'transferCertificate') return true;
    if (type === 'migrationCertificate' && !['11', '12'].includes(cls)) return false;
    if (type === 'class8Marksheet' && ['12'].includes(cls)) return false; // 8th marksheet NOT in class 12
    if (type === 'class9Marksheet' && !['10'].includes(cls)) return false;
    if (type === 'class10Marksheet' && !['11', '12'].includes(cls)) return false;
    if (type === 'class11Marksheet' && cls !== '12') return false;
    return true;
  });

  let docX = 40, docY = y;
  docsToShow.forEach(([type, label], i) => {
    const submitted = uploadedTypes.includes(type);
    doc.fillColor(submitted ? '#27ae60' : '#e74c3c').fontSize(9)
      .text(submitted ? '✓' : '✗', docX, docY);
    doc.fillColor(COLORS.text).text(label, docX + 15, docY);
    if ((i + 1) % 2 === 0) { docY += 16; docX = 40; } else docX = 310;
  });

  // ── SIGNATURE SECTION (Bottom Area — photo removed from bottom right) ──
  const sigW = 150;
  const sigH = 40;
  const sigX = pageWidth - 40 - sigW;
  const sigY = pageHeight - 88;

  // Left: Authorized Office Seal/Sign line
  doc.moveTo(40, sigY + 30).lineTo(40 + sigW, sigY + 30).strokeColor(COLORS.line).lineWidth(1).stroke();
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text('Authorized Seal / Signature', 40, sigY + 34, { width: sigW, align: 'center' });

  // Right: Student Signature
  const sigDoc = getDocInfo(student, 'signature');
  if (sigDoc && fs.existsSync(sigDoc.filePath)) {
    try {
      doc.image(sigDoc.filePath, sigX + 10, sigY - 8, { width: sigW - 20, height: 34, fit: [sigW - 20, 34], align: 'center', valign: 'center' });
    } catch (e) {}
  }
  doc.moveTo(sigX, sigY + 30).lineTo(sigX + sigW, sigY + 30).strokeColor(COLORS.line).lineWidth(1).stroke();
  doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
    .text('Student Signature', sigX, sigY + 34, { width: sigW, align: 'center' });

  // ── FOOTER ──
  doc.rect(0, pageHeight - 24, pageWidth, 24).fill(COLORS.primary);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
    .text(`Burhani Tutorials  •  Student Board Form  •  ${student.applicationId}  •  46, 47 Noorani Nagar, Indore (M.P.)`, 40, pageHeight - 16, { align: 'center', width: pageWidth - 80 });
}

// Generate full multi-page PDF buffer for a single student
async function generateStudentPDFBuffer(student) {
  // Define ordered attachments: 1st Aadhar, 2nd TC, 3rd Migration, 4th Marksheets, 5th SSMID/Samagra
  const attachmentOrder = [
    { type: 'aadhar', label: 'Aadhar Card' },
    { type: 'transferCertificate', label: 'Transfer Certificate (TC)' },
    { type: 'migrationCertificate', label: 'Migration Certificate' },
    { type: 'class10Marksheet', label: 'Class 10 Marksheet' },
    { type: 'class11Marksheet', label: 'Class 11 Marksheet' },
    { type: 'class9Marksheet', label: 'Class 9 Marksheet' },
    { type: 'class8Marksheet', label: 'Class 8 Marksheet' },
    { type: 'samagra', label: 'Samagra ID / SSMID' },
  ];

  // 1. Build Base PDF with PDFKit (Form Page + any Image Document Pages)
  const pdfKitBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, autoFirstPage: true });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // Page 1: Form
    renderStudentFormPage(doc, student);

    // Subsequent pages: Image attachments
    for (const item of attachmentOrder) {
      const docInfo = getDocInfo(student, item.type);
      if (!docInfo) continue;

      // If image, render in PDFKit
      if (docInfo.mimeType?.startsWith('image/')) {
        doc.addPage();
        drawDocumentPageHeader(doc, student, item.label);

        const imgBoxX = 40;
        const imgBoxY = 115;
        const imgBoxW = pageWidth - 80;
        const imgBoxH = pageHeight - 160;

        try {
          doc.rect(imgBoxX, imgBoxY, imgBoxW, imgBoxH).fillAndStroke('#f8fafc', COLORS.line);
          doc.image(docInfo.filePath, imgBoxX + 10, imgBoxY + 10, {
            fit: [imgBoxW - 20, imgBoxH - 20],
            align: 'center',
            valign: 'center',
          });
        } catch (err) {
          doc.fillColor(COLORS.muted).fontSize(10).text(`[Attached Image: ${item.label}]`, 50, 150);
        }

        // Footer
        doc.rect(0, pageHeight - 30, pageWidth, 30).fill(COLORS.primary);
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
          .text(`Burhani Tutorials | ${item.label} | ${student.applicationId}`, 40, pageHeight - 20, { align: 'center', width: pageWidth - 80 });
      }
    }

    doc.end();
  });

  // 2. If any attachments are PDFs, merge them using pdf-lib
  const pdfAttachments = [];
  for (const item of attachmentOrder) {
    const docInfo = getDocInfo(student, item.type);
    if (docInfo && docInfo.mimeType === 'application/pdf') {
      pdfAttachments.push({ ...item, filePath: docInfo.filePath });
    }
  }

  if (pdfAttachments.length === 0) {
    return pdfKitBuffer;
  }

  // Merge PDF attachments with pdf-lib
  const finalPdfDoc = await PDFLibDoc.load(pdfKitBuffer);

  for (const item of pdfAttachments) {
    try {
      const pdfBytes = fs.readFileSync(item.filePath);
      const donorPdf = await PDFLibDoc.load(pdfBytes);
      const copiedPages = await finalPdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
      copiedPages.forEach(p => finalPdfDoc.addPage(p));
    } catch (e) {
      console.warn(`Could not merge attachment PDF for ${item.type}:`, e.message);
    }
  }

  const mergedBytes = await finalPdfDoc.save();
  return Buffer.from(mergedBytes);
}

// ── ADMISSION FORM PDF GENERATION ──

function getAdmissionLogoPath() {
  const possiblePaths = [
    path.join(__dirname, '../../BT logo.jpeg'),
    path.join(__dirname, '../../client/public/bt-logo.jpeg'),
    path.join(__dirname, '../BT logo.jpeg'),
  ];
  return possiblePaths.find(p => fs.existsSync(p)) || null;
}

// Render Page 1 (Admission Form) — matches web preview exactly
function renderAdmissionFormPage(doc, admission) {
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const margin = 36;
  const contentW = pageWidth - margin * 2;

  const photoW = 92;
  const photoH = 115;

  // ============================================================
  // 1. HEADER — Logo | Centre Text | Student Photo
  // ============================================================
  const logoX = margin;
  const logoY = 24;
  const photoX = pageWidth - margin - photoW;
  const photoY = 24;

  // Logo box
  doc.rect(logoX, logoY, photoW, photoH).fillAndStroke('#f8fafc', COLORS.accent);
  const logoPath = getAdmissionLogoPath();
  if (logoPath) {
    try {
      doc.image(logoPath, logoX + 4, logoY + 4, { fit: [photoW - 8, photoH - 8], align: 'center', valign: 'center' });
    } catch (e) {
      doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold')
        .text('BURHANI\nTUTORIALS', logoX, logoY + 40, { width: photoW, align: 'center' });
    }
  } else {
    doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold')
      .text('BURHANI\nTUTORIALS', logoX, logoY + 40, { width: photoW, align: 'center' });
  }

  // Student Photo box
  doc.rect(photoX, photoY, photoW, photoH).fillAndStroke('#f8fafc', COLORS.accent);
  const photoDoc = getDocInfo(admission, 'photograph');
  if (photoDoc && fs.existsSync(photoDoc.filePath)) {
    try {
      doc.image(photoDoc.filePath, photoX + 3, photoY + 3, { fit: [photoW - 6, photoH - 6], align: 'center', valign: 'center' });
    } catch (e) {
      doc.fillColor(COLORS.muted).fontSize(9).font('Helvetica').text('PHOTO', photoX, photoY + 50, { width: photoW, align: 'center' });
    }
  } else {
    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
      .text('STUDENT\nPHOTO', photoX, photoY + 46, { width: photoW, align: 'center' });
  }

  // Centre header text
  const headerX = logoX + photoW + 10;
  const headerW = photoX - headerX - 10;
  let topY = 28;

  doc.fillColor(COLORS.primary).fontSize(18).font('Helvetica-Bold')
    .text('BURHANI TUTORIALS', headerX, topY, { width: headerW, align: 'center' });
  topY += 20;

  doc.fillColor(COLORS.primary).fontSize(8.5).font('Helvetica-Bold')
    .text('An Institute of Science & Commerce', headerX, topY, { width: headerW, align: 'center' });
  topY += 13;

  doc.fillColor(COLORS.accent).fontSize(8).font('Helvetica-Bold')
    .text('30+ Years of Academic Excellence & Dedicated Mentorship', headerX, topY, { width: headerW, align: 'center' });
  topY += 13;

  doc.fillColor('#1a1a1a').fontSize(8.5).font('Helvetica-Bold')
    .text('Contact: 9827252114, 9301262721', headerX, topY, { width: headerW, align: 'center' });
  topY += 12;

  doc.fillColor('#333333').fontSize(8).font('Helvetica')
    .text('Email: burhanitutorials1@gmail.com', headerX, topY, { width: headerW, align: 'center' });
  topY += 12;

  doc.fillColor('#555555').fontSize(7.5).font('Helvetica')
    .text('Address: 46, 47 Noorani Nagar | 101 Saify Nagar | 616 Row house Masakin-E-saifiya', headerX, topY, { width: headerW, align: 'center' });

  // Horizontal rule under header
  const hrY = logoY + photoH + 6;
  doc.moveTo(margin, hrY).lineTo(pageWidth - margin, hrY).strokeColor(COLORS.primary).lineWidth(2).stroke();

  // ============================================================
  // 2. ADMISSION BANNER
  // ============================================================
  const bannerY = hrY + 6;
  doc.rect(margin, bannerY, contentW, 26).fill(COLORS.primary);
  doc.fillColor('#ffffff').fontSize(12).font('Helvetica-Bold')
    .text('ADMISSION FORM — SESSION 2026-27', margin, bannerY + 7, { width: contentW, align: 'center' });

  // Banner sub-line
  const subBannerY = bannerY + 28;
  doc.rect(margin, subBannerY, contentW, 16).fill('#f1f5f9');
  doc.rect(margin, subBannerY, contentW, 16).stroke(COLORS.line);
  doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
    .text(`Application ID: ${admission.applicationId}`, margin + 10, subBannerY + 4);
  doc.fillColor(COLORS.accent).fontSize(8).font('Helvetica-Bold')
    .text(`Class: Class ${admission.classApplied}th`, margin + 200, subBannerY + 4);
  const submDate = new Date(admission.createdAt || admission.submittedAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text(`Date: ${submDate}`, margin, subBannerY + 4, { width: contentW - 10, align: 'right' });

  // ============================================================
  // 3. META BAR — Branch + Status
  // ============================================================
  const metaY = subBannerY + 18;
  doc.rect(margin, metaY, contentW, 20).fill('#ffffff');
  doc.rect(margin, metaY, contentW, 20).stroke(COLORS.line);
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text('ADMISSION BRANCH:', margin + 10, metaY + 6);
  doc.fillColor(COLORS.primary).fontSize(8.5).font('Helvetica-Bold')
    .text(`  ${admission.branch || '—'}`, margin + 85, metaY + 6);
  const statusStr = (admission.status || 'SUBMITTED').toUpperCase();
  doc.fillColor(COLORS.accent).fontSize(8).font('Helvetica-Bold')
    .text(`STATUS: ${statusStr}`, margin, metaY + 6, { width: contentW - 10, align: 'right' });

  // ============================================================
  // 4. SECTION 1: STUDENT & PARENT PARTICULARS (Vertical Table)
  // ============================================================
  let currentY = metaY + 22;

  // Section header bar
  doc.rect(margin, currentY, contentW, 18).fill('#f8fafc');
  doc.rect(margin, currentY, contentW, 18).stroke(COLORS.line);
  doc.rect(margin, currentY, 4, 18).fill(COLORS.primary);
  doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold')
    .text('1   STUDENT & PARENT PARTICULARS', margin + 12, currentY + 5);
  currentY += 18;

  // Vertical rows
  const labelColW = 150;
  const rowH = 22;

  const particulars = [
    ['Student Full Name', admission.studentName, true],
    ["Father's Name", admission.fatherName, false],
    ["Mother's Name", admission.motherName, false],
    ['Class Applying For', `Class ${admission.classApplied}th`, true],
    ['Date of Birth (DOB)', admission.dob, false],
    ['Student Mobile No.', admission.phone, false],
    ['Preferred Branch', admission.branch || '—', false],
    ['Current / Prev. School', admission.schoolName || '—', false],
    ['Residential Address', admission.address || '—', false],
  ];

  particulars.forEach(([label, value, bold], idx) => {
    const rowY = currentY + idx * rowH;
    const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const labelBg = idx % 2 === 0 ? '#f1f5f9' : '#e8edf3';

    // Full row bg
    doc.rect(margin, rowY, contentW, rowH).fill(bg);
    doc.rect(margin, rowY, contentW, rowH).stroke(COLORS.line);

    // Label cell
    doc.rect(margin, rowY, labelColW, rowH).fill(labelBg);
    doc.rect(margin + labelColW, rowY, 1, rowH).fill(COLORS.line);

    doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
      .text(label, margin + 8, rowY + 6, { width: labelColW - 12 });
    doc.fillColor(bold ? COLORS.primary : COLORS.text)
      .fontSize(bold ? 9 : 8.5)
      .font(bold ? 'Helvetica-Bold' : 'Helvetica-Bold')
      .text(value || '—', margin + labelColW + 10, rowY + 6, { width: contentW - labelColW - 16 });
  });

  currentY += particulars.length * rowH;

  // ============================================================
  // 5. SECTION 2: UNDERTAKING & DECLARATION
  // ============================================================
  currentY += 14;
  doc.rect(margin, currentY, contentW, 18).fill('#f8fafc');
  doc.rect(margin, currentY, contentW, 18).stroke(COLORS.line);
  doc.rect(margin, currentY, 4, 18).fill(COLORS.primary);
  doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold')
    .text('2   UNDERTAKING & DECLARATION', margin + 12, currentY + 5);
  currentY += 18;

  doc.rect(margin, currentY, contentW, 38).fill('#ffffff');
  doc.rect(margin, currentY, contentW, 38).stroke(COLORS.line);
  const decText = 'I hereby solemnly declare that all the particulars and information stated above are true, complete and correct to the best of my knowledge and belief. I agree to abide by all the rules, regulations, fee schedules and discipline policies of Burhani Tutorials.';
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text(decText, margin + 10, currentY + 7, { width: contentW - 20, align: 'justify', lineGap: 2 });
  currentY += 42;

  // ============================================================
  // 6. FOOTER — Office Box (left) + Parent Signature (right)
  // ============================================================
  const footerY = currentY + 14;

  // --- Office Use Only Box (left) ---
  const offW = 220;
  const offH = 100;
  doc.rect(margin, footerY, offW, offH).fill('#fafbfc');
  doc.rect(margin, footerY, offW, offH).stroke(COLORS.line);

  // Office box header strip
  doc.rect(margin, footerY, offW, 16).fill('#f1f5f9');
  doc.rect(margin, footerY, offW, 16).stroke(COLORS.line);
  doc.fillColor('#475569').fontSize(7.5).font('Helvetica-Bold')
    .text('FOR OFFICE USE ONLY', margin + 8, footerY + 4, { width: offW - 16 });

  // Application ID
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text('Application ID:', margin + 8, footerY + 22);
  doc.fillColor(COLORS.primary).fontSize(8.5).font('Helvetica-Bold')
    .text(admission.applicationId, margin + 80, footerY + 22, { width: offW - 90 });

  // Authorized Signature label
  doc.fillColor(COLORS.muted).fontSize(8).font('Helvetica')
    .text('Authorized Signature:', margin + 8, footerY + 38);

  // Blank signature box inside office box
  doc.rect(margin + 8, footerY + 52, offW - 18, 40).stroke(COLORS.line);

  // --- Parent / Guardian Signature Box (right) ---
  const sigW = 180;
  const sigH = 80;
  const sigX = pageWidth - margin - sigW;
  const sigY = footerY + 10;

  doc.rect(sigX, sigY, sigW, sigH).stroke(COLORS.line);
  doc.fillColor('#94a3b8').fontSize(7.5).font('Helvetica-Oblique')
    .text('Sign here & submit hardcopy to Institute', sigX, sigY + 36, { width: sigW, align: 'center' });

  doc.fillColor(COLORS.primary).fontSize(8.5).font('Helvetica-Bold')
    .text('Parent / Guardian Signature', sigX, sigY + sigH + 5, { width: sigW, align: 'center' });
  doc.fillColor(COLORS.muted).fontSize(7).font('Helvetica')
    .text('(Physical signature required on form submission)', sigX, sigY + sigH + 16, { width: sigW, align: 'center' });

  // ============================================================
  // 7. INSTITUTE FOOTER BAR
  // ============================================================
  doc.rect(0, pageHeight - 24, pageWidth, 24).fill(COLORS.primary);
  doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
    .text('Burhani Tutorials  •  30+ Years of Academic Excellence  •  46, 47 Noorani Nagar, Indore (M.P.)', margin, pageHeight - 15, { align: 'center', width: contentW });
}

// Generate PDF buffer for an Admission application
async function generateAdmissionPDFBuffer(admission) {
  const attachmentOrder = [
    { type: 'aadhar', label: 'Student Aadhar Card' },
  ];

  // 1. Generate PDF with PDFKit
  const pdfKitBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, autoFirstPage: true });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', err => reject(err));

    // Render Page 1 (Admission Form)
    renderAdmissionFormPage(doc, admission);

    // Render image attachments on subsequent pages
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    for (const item of attachmentOrder) {
      const docInfo = getDocInfo(admission, item.type);
      if (!docInfo) continue;

      if (docInfo.mimeType?.startsWith('image/')) {
        doc.addPage();
        drawDocumentPageHeader(doc, admission, item.label);

        const imgBoxX = 40;
        const imgBoxY = 115;
        const imgBoxW = pageWidth - 80;
        const imgBoxH = pageHeight - 160;

        try {
          doc.rect(imgBoxX, imgBoxY, imgBoxW, imgBoxH).fillAndStroke('#f8fafc', COLORS.line);
          doc.image(docInfo.filePath, imgBoxX + 10, imgBoxY + 10, {
            fit: [imgBoxW - 20, imgBoxH - 20],
            align: 'center',
            valign: 'center',
          });
        } catch (err) {
          doc.fillColor(COLORS.muted).fontSize(10).text(`[Attached Image: ${item.label}]`, 50, 150);
        }

        doc.rect(0, pageHeight - 30, pageWidth, 30).fill(COLORS.primary);
        doc.fillColor('#ffffff').fontSize(8).font('Helvetica')
          .text(`Burhani Tutorials | ${item.label} | ${admission.applicationId}`, 40, pageHeight - 20, { align: 'center', width: pageWidth - 80 });
      }
    }

    doc.end();
  });

  // 2. If any attachments are PDFs, merge them using pdf-lib
  const pdfAttachments = [];
  for (const item of attachmentOrder) {
    const docInfo = getDocInfo(admission, item.type);
    if (docInfo && docInfo.mimeType === 'application/pdf') {
      pdfAttachments.push({ ...item, filePath: docInfo.filePath });
    }
  }

  if (pdfAttachments.length === 0) {
    return pdfKitBuffer;
  }

  const finalPdfDoc = await PDFLibDoc.load(pdfKitBuffer);
  for (const item of pdfAttachments) {
    try {
      const pdfBytes = fs.readFileSync(item.filePath);
      const donorPdf = await PDFLibDoc.load(pdfBytes);
      const copiedPages = await finalPdfDoc.copyPages(donorPdf, donorPdf.getPageIndices());
      copiedPages.forEach(p => finalPdfDoc.addPage(p));
    } catch (e) {
      console.warn(`Could not merge attachment PDF for ${item.type}:`, e.message);
    }
  }

  const mergedBytes = await finalPdfDoc.save();
  return Buffer.from(mergedBytes);
}

// Generate PDF for a single admission and pipe to output stream
async function generateAdmissionPDF(admission, outputStream) {
  const buffer = await generateAdmissionPDFBuffer(admission);
  outputStream.end(buffer);
}

// Generate Consolidated Bulk PDF for multiple admissions
async function generateBulkAdmissionPDF(admissions, outputStream) {
  const finalBulkDoc = await PDFLibDoc.create();

  for (const admission of admissions) {
    try {
      const admBuffer = await generateAdmissionPDFBuffer(admission);
      const admDoc = await PDFLibDoc.load(admBuffer);
      const copiedPages = await finalBulkDoc.copyPages(admDoc, admDoc.getPageIndices());
      copiedPages.forEach(p => finalBulkDoc.addPage(p));
    } catch (err) {
      console.error(`Error generating bulk page for admission ${admission.applicationId}:`, err);
    }
  }

  const bulkBytes = await finalBulkDoc.save();
  outputStream.end(Buffer.from(bulkBytes));
}

// Generate PDF for a single student and pipe to response stream
async function generateStudentPDF(student, outputStream) {
  const buffer = await generateStudentPDFBuffer(student);
  outputStream.end(buffer);
}

// Generate Consolidated Bulk PDF for multiple students
async function generateBulkPDF(students, outputStream) {
  const finalBulkDoc = await PDFLibDoc.create();

  for (const student of students) {
    try {
      const studentBuffer = await generateStudentPDFBuffer(student);
      const studentDoc = await PDFLibDoc.load(studentBuffer);
      const copiedPages = await finalBulkDoc.copyPages(studentDoc, studentDoc.getPageIndices());
      copiedPages.forEach(p => finalBulkDoc.addPage(p));
    } catch (err) {
      console.error(`Error generating bulk page for student ${student.applicationId}:`, err);
    }
  }

  const bulkBytes = await finalBulkDoc.save();
  outputStream.end(Buffer.from(bulkBytes));
}

module.exports = {
  generateStudentPDF,
  generateBulkPDF,
  generateAdmissionPDF,
  generateBulkAdmissionPDF,
};
