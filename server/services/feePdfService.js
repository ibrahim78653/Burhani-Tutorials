const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const COLORS = {
  primary: '#1a3557',
  primaryDark: '#0f2238',
  primaryLight: '#2a5090',
  accent: '#c8a96e',
  accentDark: '#a88a4e',
  text: '#1e293b',
  textMuted: '#64748b',
  line: '#cbd5e1',
  lineLight: '#e2e8f0',
  lightBg: '#f8fafc',
  white: '#ffffff',
  highlightBg: '#fdf8ed',
  tuitionFee: '#047857',
};

function getInstituteLogoPath() {
  const possiblePaths = [
    path.join(__dirname, '../../BT logo.jpeg'),
    path.join(__dirname, '../../client/public/bt-logo.jpeg'),
    path.join(__dirname, '../BT logo.jpeg'),
    path.join(__dirname, '../../public/bt-logo.jpeg'),
  ];
  return possiblePaths.find(p => fs.existsSync(p)) || null;
}

function formatDate(date) {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return '₹ ' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getFeeItemLabel(feeType) {
  if (feeType === 'TUITION_FEE') return 'Academic Tuition & Coaching Fees';
  return 'Fee Payment';
}

function getCategoryDisplay(receiptCategory) {
  return '[ TUITION FEES ]';
}

function generateFeeReceiptPDFBuffer(receipt) {
  return new Promise((resolve, reject) => {
    try {
      // Support both old (feeType) and new (feeItems) schema
      const feeItems = receipt.feeItems && receipt.feeItems.length > 0
        ? receipt.feeItems
        : [{ feeType: receipt.feeType || 'TUITION_FEE', amount: receipt.amountPaid, description: '' }];

      const receiptCategory = receipt.receiptCategory || receipt.feeType || 'TUITION_FEE';

      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        info: {
          Title: `Fee Receipt - ${receipt.receiptNumber} - ${receipt.studentName}`,
          Author: 'Burhani Tutorials',
          Subject: `Fee Receipt - ${receiptCategory}`,
        },
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      const margin = 36;
      const pageWidth = doc.page.width;
      const contentW = pageWidth - margin * 2;

      // ── OUTER DECORATIVE BORDER ──
      doc.lineWidth(1.5).strokeColor(COLORS.primary)
        .rect(margin - 6, margin - 6, contentW + 12, doc.page.height - (margin - 6) * 2)
        .stroke();
      doc.lineWidth(0.5).strokeColor(COLORS.accent)
        .rect(margin - 2, margin - 2, contentW + 4, doc.page.height - (margin - 2) * 2)
        .stroke();

      // ── 1. HEADER SECTION ──
      const headerH = 100;
      doc.rect(margin, margin, contentW, headerH).fill(COLORS.primary);

      // Logo on Top-Left
      const logoW = 74;
      const logoH = 74;
      const logoX = margin + 14;
      const logoY = margin + 13;

      doc.rect(logoX, logoY, logoW, logoH).fillAndStroke(COLORS.white, COLORS.accent);
      const logoPath = getInstituteLogoPath();
      if (logoPath) {
        try {
          doc.image(logoPath, logoX + 3, logoY + 3, {
            fit: [logoW - 6, logoH - 6],
            align: 'center',
            valign: 'center',
          });
        } catch (e) {
          doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
            .text('BURHANI\nTUTORIALS', logoX, logoY + 28, { width: logoW, align: 'center' });
        }
      } else {
        doc.fillColor(COLORS.primary).fontSize(8).font('Helvetica-Bold')
          .text('BURHANI\nTUTORIALS', logoX, logoY + 28, { width: logoW, align: 'center' });
      }

      // Header Text (Centered on receipt)
      const textX = margin;
      const textW = contentW;

      doc.fillColor(COLORS.white).fontSize(22).font('Helvetica-Bold')
        .text('BURHANI TUTORIALS', textX, margin + 14, { width: textW, align: 'center' });

      doc.fillColor(COLORS.accent).fontSize(9.5).font('Helvetica-Bold')
        .text('An Institute of Science & Commerce', textX, margin + 42, { width: textW, align: 'center' });

      doc.fillColor('#e2e8f0').fontSize(8.5).font('Helvetica')
        .text('Classes 5th to 12th  •  Science (PCM / PCB) & Commerce  •  Indore (M.P.)', textX, margin + 58, { width: textW, align: 'center' });

      doc.fillColor('#cbd5e1').fontSize(8).font('Helvetica')
        .text('Ph: 9827252114, 9301262721   |   Email: burhanitutorials1@gmail.com', textX, margin + 74, { width: textW, align: 'center' });

      // ── 2. RECEIPT TITLE BANNER (Gold accent) ──
      let currentY = margin + headerH;
      const bannerH = 30;
      doc.rect(margin, currentY, contentW, bannerH).fill(COLORS.accent);

      doc.fillColor(COLORS.primaryDark).fontSize(13).font('Helvetica-Bold')
        .text('OFFICIAL FEE RECEIPT', margin + 16, currentY + 8, { characterSpacing: 1.5 });

      doc.fillColor(COLORS.primaryDark).fontSize(10).font('Helvetica-Bold')
        .text(getCategoryDisplay(receiptCategory), margin, currentY + 9, { width: contentW - 16, align: 'right' });

      currentY += bannerH;

      // ── 3. METADATA BAR (Receipt No & Date) ──
      const metaH = 38;
      doc.rect(margin, currentY, contentW, metaH).fill(COLORS.lightBg);
      doc.rect(margin, currentY, contentW, metaH).stroke(COLORS.line);

      doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica')
        .text('RECEIPT / INVOICE NO:', margin + 16, currentY + 8);
      doc.fillColor(COLORS.primary).fontSize(12).font('Helvetica-Bold')
        .text(receipt.receiptNumber || '—', margin + 16, currentY + 20);

      doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica')
        .text('DATE OF INVOICE:', margin, currentY + 8, { width: contentW - 16, align: 'right' });
      doc.fillColor(COLORS.text).fontSize(11).font('Helvetica-Bold')
        .text(formatDate(receipt.invoiceDate), margin, currentY + 20, { width: contentW - 16, align: 'right' });

      currentY += metaH + 16;

      // ── 4. STUDENT DETAILS SECTION ──
      doc.rect(margin, currentY, contentW, 22).fill(COLORS.primary);
      doc.fillColor(COLORS.white).fontSize(9.5).font('Helvetica-Bold')
        .text('STUDENT INFORMATION', margin + 12, currentY + 6);
      currentY += 22;

      const studentRows = [
        ['Student Full Name', receipt.studentName, true],
        ['Class / Grade', receipt.classApplied ? `Class ${receipt.classApplied.replace(/^class\s*/i, '')}th` : '—', true],
        ['Institute Branch', receipt.branch || '—', false],
      ];

      const rowH = 26;
      const labelW = 160;

      studentRows.forEach(([label, value, bold], idx) => {
        const rowY = currentY + idx * rowH;
        const rowBg = idx % 2 === 0 ? COLORS.white : COLORS.lightBg;

        doc.rect(margin, rowY, contentW, rowH).fill(rowBg);
        doc.rect(margin, rowY, contentW, rowH).stroke(COLORS.line);

        doc.rect(margin, rowY, labelW, rowH).fill(idx % 2 === 0 ? '#f1f5f9' : '#e2e8f0');
        doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica')
          .text(label, margin + 10, rowY + 8, { width: labelW - 16 });

        doc.fillColor(bold ? COLORS.primary : COLORS.text)
          .fontSize(bold ? 10 : 9.5)
          .font(bold ? 'Helvetica-Bold' : 'Helvetica')
          .text(value || '—', margin + labelW + 14, rowY + 7, { width: contentW - labelW - 24 });
      });

      currentY += studentRows.length * rowH + 16;

      // ── 5. PAYMENT PARTICULARS TABLE ──
      doc.rect(margin, currentY, contentW, 22).fill(COLORS.primary);
      doc.fillColor(COLORS.white).fontSize(9.5).font('Helvetica-Bold')
        .text('PAYMENT DETAILS & BREAKDOWN', margin + 12, currentY + 6);
      currentY += 22;

      // Column headers
      const thH = 22;
      doc.rect(margin, currentY, contentW, thH).fill('#e2e8f0');
      doc.rect(margin, currentY, contentW, thH).stroke(COLORS.line);

      doc.fillColor(COLORS.text).fontSize(8.5).font('Helvetica-Bold')
        .text('S.No.', margin + 10, currentY + 6, { width: 35 })
        .text('Particulars / Fee Description', margin + 50, currentY + 6, { width: 220 })
        .text('Payment Mode', margin + 275, currentY + 6, { width: 100 })
        .text('Amount (INR)', margin + 380, currentY + 6, { width: contentW - 390, align: 'right' });
      currentY += thH;

      // Fee line items
      feeItems.forEach((item, idx) => {
        const itemH = item.description ? 38 : 28;
        const rowBg = idx % 2 === 0 ? COLORS.white : COLORS.lightBg;

        doc.rect(margin, currentY, contentW, itemH).fill(rowBg);
        doc.rect(margin, currentY, contentW, itemH).stroke(COLORS.line);

        doc.fillColor(COLORS.text).fontSize(9).font('Helvetica')
          .text(`${idx + 1}.`, margin + 10, currentY + 9, { width: 35 });

        // Description with optional note
        const descLabel = getFeeItemLabel(item.feeType);
        const badgeColor = '#047857';
        const badgeBg = '#d1fae5';

        // Tiny badge for type
        doc.rect(margin + 50, currentY + 8, 50, 13).fill(badgeBg);
        doc.fillColor(badgeColor).fontSize(6.5).font('Helvetica-Bold')
          .text('TUITION FEE', margin + 52, currentY + 11, { width: 46, align: 'center' });

        doc.fillColor(COLORS.text).fontSize(8.5).font('Helvetica-Bold')
          .text(descLabel, margin + 105, currentY + 9, { width: 165 });

        if (item.description) {
          doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
            .text(item.description, margin + 105, currentY + 23, { width: 165 });
        }

        doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica')
          .text(receipt.paymentMode || 'Cash', margin + 275, currentY + 9, { width: 100 });

        doc.fillColor(COLORS.primary).fontSize(10.5).font('Helvetica-Bold')
          .text(formatCurrency(item.amount), margin + 380, currentY + 9, { width: contentW - 390, align: 'right' });

        currentY += itemH;
      });

      // ── 6. TOTAL AMOUNT HIGHLIGHT CARD ──
      const totalH = 46;
      doc.rect(margin, currentY, contentW, totalH).fill(COLORS.highlightBg);
      doc.rect(margin, currentY, contentW, totalH).stroke(COLORS.accent);

      doc.fillColor(COLORS.accentDark).fontSize(9.5).font('Helvetica-Bold')
        .text('TOTAL AMOUNT PAID:', margin + 16, currentY + 16);

      doc.fillColor(COLORS.primary).fontSize(16).font('Helvetica-Bold')
        .text(formatCurrency(receipt.amountPaid), margin + 200, currentY + 13, { width: contentW - 216, align: 'right' });

      currentY += totalH;

      // ── 7. AMOUNT IN WORDS ROW ──
      const wordsH = 32;
      doc.rect(margin, currentY, contentW, wordsH).fill(COLORS.lightBg);
      doc.rect(margin, currentY, contentW, wordsH).stroke(COLORS.line);

      doc.fillColor(COLORS.textMuted).fontSize(8.5).font('Helvetica-Bold')
        .text('Amount in Words:', margin + 12, currentY + 10);

      doc.fillColor(COLORS.text).fontSize(9).font('Helvetica-Bold')
        .text(receipt.amountInWords || '—', margin + 115, currentY + 10, { width: contentW - 125 });

      currentY += wordsH;

      // Remarks if present
      if (receipt.remarks && receipt.remarks.trim()) {
        const remarksH = 26;
        doc.rect(margin, currentY, contentW, remarksH).fill(COLORS.white);
        doc.rect(margin, currentY, contentW, remarksH).stroke(COLORS.line);
        doc.fillColor(COLORS.textMuted).fontSize(8).font('Helvetica')
          .text(`Remarks / Notes: ${receipt.remarks}`, margin + 12, currentY + 7, { width: contentW - 24 });
        currentY += remarksH;
      }

      currentY += 20;

      // ── 8. TERMS / UNDERTAKING ──
      const termsH = 40;
      doc.rect(margin, currentY, contentW - 200, termsH).fill(COLORS.lightBg);
      doc.rect(margin, currentY, contentW - 200, termsH).stroke(COLORS.lineLight);

      doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
        .text('Terms & Conditions:', margin + 8, currentY + 6)
        .text('• Fees once paid are non-refundable and non-transferable under any circumstances.\n• This is an official receipt manually recorded by Burhani Tutorials administration.', margin + 8, currentY + 16, { width: contentW - 220, lineGap: 2 });

      // ── 9. ADMIN SIGNATURE ──
      const sigBoxW = 180;
      const sigBoxX = margin + contentW - sigBoxW;
      const sigBoxY = currentY;

      doc.strokeColor(COLORS.primary).lineWidth(1)
        .moveTo(sigBoxX + 10, sigBoxY + 28)
        .lineTo(sigBoxX + sigBoxW - 10, sigBoxY + 28)
        .stroke();

      doc.fillColor(COLORS.primary).fontSize(9).font('Helvetica-Bold')
        .text('Admin Signature', sigBoxX, sigBoxY + 32, { width: sigBoxW, align: 'center' });
      doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
        .text('Authorized Signatory', sigBoxX, sigBoxY + 44, { width: sigBoxW, align: 'center' });

      // ── 10. BOTTOM FOOTER ──
      const footerY = doc.page.height - margin - 20;
      doc.strokeColor(COLORS.line).lineWidth(0.5)
        .moveTo(margin, footerY - 6)
        .lineTo(margin + contentW, footerY - 6)
        .stroke();

      doc.fillColor(COLORS.textMuted).fontSize(7.5).font('Helvetica')
        .text('Burhani Tutorials • Official Fee Receipt • Generated by Admin Portal', margin, footerY, { width: contentW / 2, align: 'left' })
        .text(`Generated on ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}`, margin + contentW / 2, footerY, { width: contentW / 2, align: 'right' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Generates and saves a Fee Receipt PDF to disk
 */
async function generateAndSaveFeeReceiptPDF(receipt, destinationPath) {
  const buffer = await generateFeeReceiptPDFBuffer(receipt);
  fs.writeFileSync(destinationPath, buffer);
  return buffer;
}

module.exports = {
  generateFeeReceiptPDFBuffer,
  generateAndSaveFeeReceiptPDF,
};
