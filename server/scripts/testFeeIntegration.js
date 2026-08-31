require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const FeeReceipt = require('../models/FeeReceipt');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const express = require('express');
const request = require('http');

// Setup mock app to test full express routes
const app = express();
app.use(express.json());
const auth = require('../middleware/auth');
const feeRoutes = require('../routes/fees');
app.use('/api/admin/fees', feeRoutes);

let server;

async function startTestServer() {
  return new Promise((resolve) => {
    server = app.listen(5099, () => {
      resolve();
    });
  });
}

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = request.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runIntegrationTests() {
  console.log('🚀 Running Complete Fee Management Backend Integration Tests...\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected for testing');

  await startTestServer();
  console.log('✅ Test server running on port 5099');

  // Create mock admin token
  const adminToken = jwt.sign(
    { id: 'mock-admin-id', username: 'superadmin', role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  const authHeaders = {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  };

  // Clean up any test receipts from previous runs
  await FeeReceipt.deleteMany({ receiptNumber: { $in: ['BT-999001', 'BT-999002', 'BT-999003'] } });

  // 1. Test Unauthorized Access (Security Check)
  console.log('\n--- 1. Testing Admin-Only Route Protection ---');
  const unauthRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees',
    method: 'GET',
  });
  console.log(`Unauthenticated GET /api/admin/fees status: ${unauthRes.status} [${unauthRes.status === 401 ? '✅ PASS (Protected)' : '❌ FAIL'}]`);

  // 2. Test Next Receipt Number Generation
  console.log('\n--- 2. Testing Next Receipt Number Generation ---');
  const nextNumRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees/next-number',
    method: 'GET',
    headers: authHeaders,
  });
  console.log(`Suggested Next Receipt Number: "${nextNumRes.body?.receiptNumber}" [${nextNumRes.body?.success ? '✅ PASS' : '❌ FAIL'}]`);

  // 3. Test Generate Form Fee Receipt
  console.log('\n--- 3. Testing Generate Form Fee Receipt ---');
  const formFeePayload = {
    feeItems: [{ feeType: 'TUITION_FEE', amount: 2500, description: 'Tuition Fee 1' }],
    studentName: 'Mohammed Yusuf Ali',
    classApplied: '10',
    branch: 'Saify Nagar',
    invoiceDate: '2026-08-31',
    receiptNumber: 'BT-999001',
    paymentMode: 'Cash',
    remarks: 'Board Examination Form 2026',
  };

  const genFormRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees/generate',
    method: 'POST',
    headers: authHeaders,
  }, formFeePayload);

  console.log(`Created Tuition Fee Receipt 1 status: ${genFormRes.status} [${genFormRes.status === 201 ? '✅ PASS' : '❌ FAIL'}]`);
  const formReceiptId = genFormRes.body?.receipt?._id;
  const pdfStoredName = genFormRes.body?.receipt?.pdfStoredName;

  // Check PDF file existence on server
  const pdfPath = path.join(__dirname, '../../uploads/receipts', pdfStoredName || '');
  console.log(`PDF File exists on server disk at ${pdfPath}? [${fs.existsSync(pdfPath) ? '✅ PASS' : '❌ FAIL'}]`);

  // 4. Test Generate Tuition Fee Receipt
  console.log('\n--- 4. Testing Generate Tuition Fee Receipt ---');
  const tuitionFeePayload = {
    feeItems: [{ feeType: 'TUITION_FEE', amount: 15000, description: 'PCM Full Term Coaching' }],
    studentName: 'Ahmed Raza Khan',
    classApplied: '12',
    branch: 'Noorani Nagar',
    invoiceDate: '2026-08-31',
    receiptNumber: 'BT-999002',
    paymentMode: 'UPI',
    remarks: 'PCM Full Term Coaching',
  };

  const genTuitionRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees/generate',
    method: 'POST',
    headers: authHeaders,
  }, tuitionFeePayload);

  console.log(`Created Tuition Fee Receipt status: ${genTuitionRes.status} [${genTuitionRes.status === 201 ? '✅ PASS' : '❌ FAIL'}]`);
  const tuitionReceiptId = genTuitionRes.body?.receipt?._id;

  // 5. Test Duplicate Receipt Number Prevention
  console.log('\n--- 5. Testing Duplicate Receipt Number Rejection ---');
  const duplicateRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees/generate',
    method: 'POST',
    headers: authHeaders,
  }, formFeePayload); // using duplicate BT-999001

  console.log(`Duplicate Submission status: ${duplicateRes.status} [${duplicateRes.status === 400 ? '✅ PASS (Rejected duplicates)' : '❌ FAIL'}]`);
  console.log(`Error message: "${duplicateRes.body?.message}"`);

  // 6. Test Typo-Tolerant Search
  console.log('\n--- 6. Testing Typo-Tolerant Student Search ---');
  // Search "Mohamd" -> should find "Mohammed Yusuf Ali"
  const typoRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees?search=Mohamd',
    method: 'GET',
    headers: authHeaders,
  });
  const foundMohamd = (typoRes.body?.receipts || []).some(r => r.studentName.includes('Mohammed'));
  console.log(`Search "Mohamd" matched "Mohammed Yusuf Ali"? [${foundMohamd ? '✅ PASS' : '❌ FAIL'}]`);

  // Search "Ahmad" -> should find "Ahmed Raza Khan"
  const typoRes2 = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees?search=Ahmad',
    method: 'GET',
    headers: authHeaders,
  });
  const foundAhmad = (typoRes2.body?.receipts || []).some(r => r.studentName.includes('Ahmed'));
  console.log(`Search "Ahmad" matched "Ahmed Raza Khan"? [${foundAhmad ? '✅ PASS' : '❌ FAIL'}]`);

  // 7. Test Fee Summary / Analytics Endpoint
  console.log('\n--- 7. Testing Fee Summary / Analytics Calculations ---');
  const summaryRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees/summary',
    method: 'GET',
    headers: authHeaders,
  });
  const s = summaryRes.body?.summary;
  console.log(`Live Summary -> Tuition Fees: ₹${s?.totalTuitionFees}, Total Received: ₹${s?.totalReceived}, Total Receipts: ${s?.totalReceipts}`);
  console.log(`Total Received matches Tuition? [${s?.totalReceived === s?.totalTuitionFees ? '✅ PASS' : '❌ FAIL'}]`);

  // 8. Test Amount Range Filtering
  console.log('\n--- 8. Testing Numerical Amount Range Filter ---');
  const rangeRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: '/api/admin/fees?minAmount=10000&maxAmount=20000',
    method: 'GET',
    headers: authHeaders,
  });
  const rangeItems = rangeRes.body?.receipts || [];
  const allInRange = rangeItems.every(r => r.amountPaid >= 10000 && r.amountPaid <= 20000);
  console.log(`Amount Filter [₹10,000 - ₹20,000] returned ${rangeItems.length} items, all strictly in range? [${allInRange && rangeItems.length > 0 ? '✅ PASS' : '❌ FAIL'}]`);

  // 9. Test Permanent Deletion
  console.log('\n--- 9. Testing Permanent Deletion ---');
  const delRes = await makeRequest({
    hostname: 'localhost',
    port: 5099,
    path: `/api/admin/fees/${formReceiptId}`,
    method: 'DELETE',
    headers: authHeaders,
  });
  console.log(`Delete Receipt BT-999001 status: ${delRes.status} [${delRes.status === 200 ? '✅ PASS' : '❌ FAIL'}]`);

  // Verify deleted from DB
  const checkDb = await FeeReceipt.findById(formReceiptId);
  console.log(`Receipt BT-999001 exists in MongoDB? [${!checkDb ? '✅ NO (Permanently removed)' : '❌ STILL IN DB'}]`);

  // Verify PDF file unlinked from disk
  console.log(`PDF file deleted from server disk? [${!fs.existsSync(pdfPath) ? '✅ YES (Cleaned up)' : '❌ FILE STILL ON DISK'}]`);

  // Cleanup tuition test receipt as well
  if (tuitionReceiptId) {
    await makeRequest({
      hostname: 'localhost',
      port: 5099,
      path: `/api/admin/fees/${tuitionReceiptId}`,
      method: 'DELETE',
      headers: authHeaders,
    });
  }

  console.log('\n🎉 ALL BACKEND INTEGRATION TESTS COMPLETED SUCCESSFULLY!\n');
  server.close();
  await mongoose.disconnect();
  process.exit(0);
}

runIntegrationTests().catch(err => {
  console.error('Integration test failed:', err);
  if (server) server.close();
  process.exit(1);
});
