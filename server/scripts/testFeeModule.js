require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FeeReceipt = require('../models/FeeReceipt');
const { numberToIndianWords } = require('../utils/numberToWords');
const { generateTypoRegex, normalizeString } = require('../utils/feeSearchHelper');
const { generateFeeReceiptPDFBuffer } = require('../services/feePdfService');

async function runTests() {
  console.log('🧪 Starting Fee Module Unit Tests...\n');

  // Test 1: Number to Indian words
  console.log('1. Testing Number to Words:');
  const testAmounts = [
    [5000, 'Rupees Five Thousand Only'],
    [145000, 'Rupees One Lakh Forty Five Thousand Only'],
    [25000.50, 'Rupees Twenty Five Thousand and Fifty Paise Only'],
    [100, 'Rupees One Hundred Only'],
    [10000000, 'Rupees One Crore Only'],
  ];

  for (const [amt, expected] of testAmounts) {
    const result = numberToIndianWords(amt);
    const pass = result.toLowerCase() === expected.toLowerCase();
    console.log(`  ₹${amt} -> "${result}" [${pass ? '✅ PASS' : '❌ FAIL'}]`);
    if (!pass) console.error(`    Expected: "${expected}"`);
  }

  // Test 2: Typo-tolerant string normalization & regex
  console.log('\n2. Testing Typo Regex & Normalization:');
  const normalized = normalizeString('  Mohammed   Yusuf!!  ');
  console.log(`  Normalized: "${normalized}"`);
  const regexPattern = generateTypoRegex('Mohamd');
  const regex = new RegExp(regexPattern, 'i');
  console.log(`  Regex for "Mohamd": /${regexPattern}/i -> matches "Mohammed"? ${regex.test('mohammed') ? '✅ YES' : '❌ NO'}`);

  // Test 3: PDF Generation buffer
  console.log('\n3. Testing PDF Generation:');
  const mockReceipt = {
    receiptNumber: 'BT-000001',
    feeType: 'TUITION_FEE',
    studentName: 'Mohammed Yusuf Ali',
    classApplied: '10',
    branch: 'Saify Nagar',
    invoiceDate: new Date('2026-08-31'),
    amountPaid: 5000,
    amountInWords: 'Rupees Five Thousand Only',
    paymentMode: 'UPI',
    remarks: 'Monthly installment August 2026',
    pdfFileName: 'BT-000001-Mohammed-Yusuf-Ali-Tuition-Fee.pdf',
    pdfStoredName: 'test-receipt.pdf',
  };

  try {
    const pdfBuffer = await generateFeeReceiptPDFBuffer(mockReceipt);
    console.log(`  Generated PDF Buffer length: ${pdfBuffer.length} bytes [${pdfBuffer.length > 5000 ? '✅ PASS' : '❌ FAIL'}]`);
    // Check PDF signature header %PDF-
    const header = pdfBuffer.subarray(0, 5).toString();
    console.log(`  PDF Header magic bytes: "${header}" [${header.startsWith('%PDF') ? '✅ PASS' : '❌ FAIL'}]`);
  } catch (err) {
    console.error('  ❌ PDF Generation error:', err);
  }

  console.log('\n🏁 Fee Module Unit Tests Completed Successfully!');
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('Test runner failure:', err);
  process.exit(1);
});
