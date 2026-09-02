import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../utils/api';
import toast from 'react-hot-toast';
import { numberToWordsClient } from '../../utils/numberToWordsClient';
import { INSTITUTE_INFO, BRANCHES } from '../../data/instituteData';
import './AdminFees.css';

const CLASS_OPTIONS = ['5', '6', '7', '8', '9', '10', '11', '12'];
const PAYMENT_MODES = ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'];

const FEE_TYPE_LABELS = {
  TUITION_FEE: 'Tuition Fees',
};

const FEE_TYPE_DESCRIPTIONS = {
  TUITION_FEE: 'Academic Tuition & Coaching Fees',
};

function getCategoryBadge(receipt) {
  return <span className="fee-badge fee-badge-tuition">🎓 Tuition Fee</span>;
}

// Reusable A4 Receipt View Component
function ReceiptSheet({ data, isFormData = false }) {
  const formatDateDisplay = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Support both form data (feeItems) and receipt data (feeItems or old feeType)
  const feeItems = isFormData
    ? data.feeItems
    : (data.feeItems && data.feeItems.length > 0
      ? data.feeItems
      : [{ feeType: data.feeType || 'TUITION_FEE', amount: data.amountPaid, description: '' }]);

  const totalAmount = isFormData
    ? feeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    : data.amountPaid;

  const receiptCategory = 'TUITION_FEE';

  const categoryLabel = '[ TUITION FEES ]';

  return (
    <div className="a4-receipt-sheet">
      {/* Header */}
      <div className="a4-receipt-header">
        <div className="a4-logo-box">
          <img src="/bt-logo.webp" alt="Burhani Tutorials Logo" />
        </div>
        <div className="a4-institute-details">
          <div className="a4-institute-title">BURHANI TUTORIALS</div>
          <div className="a4-institute-tagline">An Institute of Science &amp; Commerce</div>
          <div className="a4-institute-sub">Classes 5th to 12th • Science &amp; Commerce • Indore (M.P.)</div>
          <div className="a4-institute-contacts">
            📞 {INSTITUTE_INFO.phones.join(', ')} | ✉️ {INSTITUTE_INFO.email}
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="a4-banner-bar">
        <span>OFFICIAL FEE RECEIPT</span>
        <span className="a4-banner-category">{categoryLabel}</span>
      </div>

      {/* Meta Bar */}
      <div className="a4-meta-bar">
        <div className="a4-meta-item">
          <div className="label">RECEIPT / INVOICE NO:</div>
          <div className="value">{isFormData ? (data.receiptNumber || 'BT-XXXXXX') : data.receiptNumber}</div>
        </div>
        <div className="a4-meta-item a4-meta-right">
          <div className="label">DATE OF INVOICE:</div>
          <div className="value">{formatDateDisplay(data.invoiceDate)}</div>
        </div>
      </div>

      {/* Student Details */}
      <div className="a4-section-heading">STUDENT INFORMATION</div>
      <table className="a4-table">
        <tbody>
          <tr>
            <td className="label-col">Student Full Name</td>
            <td className="val-col">{data.studentName || '—'}</td>
          </tr>
          <tr>
            <td className="label-col">Class / Grade</td>
            <td className="val-col">Class {data.classApplied}th</td>
          </tr>
          <tr>
            <td className="label-col">Institute Branch</td>
            <td className="val-col">{data.branch}</td>
          </tr>
        </tbody>
      </table>

      {/* Payment Particulars */}
      <div className="a4-section-heading">PAYMENT PARTICULARS</div>
      <table className="a4-table a4-payment-table">
        <thead>
          <tr>
            <th className="col-sno">S.No.</th>
            <th>Fee Description</th>
            <th className="col-mode">Payment Mode</th>
            <th className="col-amt">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {feeItems.map((item, idx) => (
            <tr key={idx} className="row-tuition-fee">
              <td className="col-sno">{idx + 1}.</td>
              <td>
                <div className="fee-item-desc-cell">
                  <span className="fee-item-type-badge badge-tuition">
                    🎓 Tuition Fee
                  </span>
                  <strong>{FEE_TYPE_DESCRIPTIONS[item.feeType] || 'Fee Payment'}</strong>
                  {item.description && (
                    <span className="fee-item-note">Note: {item.description}</span>
                  )}
                </div>
              </td>
              <td className="col-mode">{data.paymentMode || isFormData ? data.paymentMode : '—'}</td>
              <td className="col-amt">₹ {parseFloat(item.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Total */}
      <div className="a4-total-card">
        <span className="a4-total-label">Total Amount Paid:</span>
        <span className="a4-total-val">₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>

      {/* Amount in words */}
      <div className="a4-words-row">
        <strong>Amount in Words:</strong>
        <span>{isFormData ? numberToWordsClient(totalAmount) : (data.amountInWords || numberToWordsClient(totalAmount))}</span>
      </div>

      {/* Remarks */}
      {data.remarks && (
        <div className="a4-remarks-row">
          <strong>Remarks:</strong> {data.remarks}
        </div>
      )}

      {/* Bottom section */}
      <div className="a4-bottom-section">
        <div className="a4-terms-box">
          <strong>Terms &amp; Conditions:</strong><br />
          • Fees once paid are non-refundable and non-transferable under any circumstances.<br />
          • Manually recorded and issued by Burhani Tutorials administration.
        </div>
        <div className="a4-signature-box">
          <div className="a4-signature-line" />
          <div className="a4-signature-label">Admin Signature</div>
          <div className="a4-signature-sub">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminFees() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [feeTypeFilter, setFeeTypeFilter] = useState(searchParams.get('feeType') || 'ALL');
  const [branch, setBranch] = useState(searchParams.get('branch') || 'ALL');
  const [classFilter, setClassFilter] = useState(searchParams.get('classFilter') || 'ALL');
  const [paymentMode, setPaymentMode] = useState(searchParams.get('paymentMode') || 'ALL');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [maxAmount, setMaxAmount] = useState(searchParams.get('maxAmount') || '');
  const [dateFrom, setDateFrom] = useState(searchParams.get('dateFrom') || '');
  const [dateTo, setDateTo] = useState(searchParams.get('dateTo') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'createdAt');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);
  const [limit] = useState(15);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Data States
  const [receipts, setReceipts] = useState([]);
  const [summary, setSummary] = useState({
    totalTuitionFees: 0,
    totalReceived: 0,
    totalReceipts: 0,
    tuitionItemsCount: 0,
  });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  // Generate Receipt Wizard State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form state with feeItems array
  const getInitialFormState = () => ({
    studentName: '',
    classApplied: '10',
    branch: BRANCHES[0]?.branchKey || 'Saify Nagar',
    invoiceDate: new Date().toISOString().split('T')[0],
    receiptNumber: '',
    paymentMode: 'Cash',
    remarks: '',
    feeItems: [{ feeType: 'TUITION_FEE', amount: '', description: '' }],
  });

  const [formData, setFormData] = useState(getInitialFormState());

  // View and Delete state
  const [viewReceipt, setViewReceipt] = useState(null);
  const [deleteReceipt, setDeleteReceipt] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Fetch Receipts ──
  const fetchReceipts = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page, limit,
        search: search.trim(),
        feeType: feeTypeFilter,
        branch, classFilter, paymentMode,
        minAmount, maxAmount, dateFrom, dateTo,
        sortBy, sortOrder,
      };

      const [resList, resSummary] = await Promise.all([
        API.get('/admin/fees', { params }),
        API.get('/admin/fees/summary', { params }),
      ]);

      if (resList.data.success) {
        setReceipts(resList.data.receipts || []);
        setPagination(resList.data.pagination || { total: 0, pages: 1 });
      }
      if (resSummary.data.success) {
        setSummary(resSummary.data.summary);
      }
    } catch (err) {
      toast.error('Failed to fetch fee receipts');
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, feeTypeFilter, branch, classFilter, paymentMode, minAmount, maxAmount, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  // Sync to URL
  useEffect(() => {
    const p = {};
    if (search) p.search = search;
    if (feeTypeFilter !== 'ALL') p.feeType = feeTypeFilter;
    if (branch !== 'ALL') p.branch = branch;
    if (classFilter !== 'ALL') p.classFilter = classFilter;
    if (paymentMode !== 'ALL') p.paymentMode = paymentMode;
    if (minAmount) p.minAmount = minAmount;
    if (maxAmount) p.maxAmount = maxAmount;
    if (dateFrom) p.dateFrom = dateFrom;
    if (dateTo) p.dateTo = dateTo;
    if (sortBy !== 'createdAt') p.sortBy = sortBy;
    if (sortOrder !== 'desc') p.sortOrder = sortOrder;
    if (page > 1) p.page = page;
    setSearchParams(p, { replace: true });
  }, [search, feeTypeFilter, branch, classFilter, paymentMode, minAmount, maxAmount, dateFrom, dateTo, sortBy, sortOrder, page, setSearchParams]);

  const handleClearFilters = () => {
    setSearch(''); setFeeTypeFilter('ALL'); setBranch('ALL');
    setClassFilter('ALL'); setPaymentMode('ALL');
    setMinAmount(''); setMaxAmount('');
    setDateFrom(''); setDateTo('');
    setSortBy('createdAt'); setSortOrder('desc'); setPage(1);
  };

  // Open Generate Receipt Modal
  const handleOpenGenerate = async () => {
    try {
      const res = await API.get('/admin/fees/next-number');
      const nextNum = res.data.success ? res.data.receiptNumber : 'BT-000001';
      setFormData({ ...getInitialFormState(), receiptNumber: nextNum });
      setModalStep(1);
      setGenerateModalOpen(true);
    } catch (err) {
      setFormData({ ...getInitialFormState(), receiptNumber: 'BT-000001' });
      setModalStep(1);
      setGenerateModalOpen(true);
    }
  };

  // ── Fee Items Management ──
  const updateFeeItem = (idx, field, value) => {
    setFormData(prev => {
      const items = [...prev.feeItems];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, feeItems: items };
    });
  };

  const addFeeItem = () => {
    setFormData(prev => ({
      ...prev,
      feeItems: [...prev.feeItems, { feeType: 'TUITION_FEE', amount: '', description: '' }],
    }));
  };

  const removeFeeItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      feeItems: prev.feeItems.filter((_, i) => i !== idx),
    }));
  };

  const totalFeeAmount = formData.feeItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

  // Step 1 Validation
  const handleProceedToPreview = (e) => {
    e.preventDefault();
    if (!formData.studentName.trim()) { toast.error('Please enter student name'); return; }
    if (!formData.receiptNumber.trim()) { toast.error('Please enter receipt number'); return; }
    if (!formData.invoiceDate) { toast.error('Please select invoice date'); return; }
    if (formData.feeItems.length === 0) { toast.error('Add at least one fee item'); return; }

    for (let i = 0; i < formData.feeItems.length; i++) {
      const item = formData.feeItems[i];
      const amt = parseFloat(item.amount);
      if (isNaN(amt) || amt <= 0) {
        toast.error(`Fee item ${i + 1}: please enter a valid positive amount`);
        return;
      }
    }
    setModalStep(2);
  };

  // Submit & Generate Receipt
  const handleConfirmGenerate = async () => {
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        receiptNumber: formData.receiptNumber.trim().toUpperCase(),
        feeItems: formData.feeItems.map(item => ({
          feeType: item.feeType,
          amount: parseFloat(item.amount),
          description: (item.description || '').trim(),
        })),
      };

      const res = await API.post('/admin/fees/generate', payload);
      if (res.data.success) {
        toast.success(`✓ Receipt ${res.data.receipt.receiptNumber} generated!`);
        setGenerateModalOpen(false);
        fetchReceipts();
        setViewReceipt(res.data.receipt);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to generate receipt';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Download PDF
  const handleDownloadPdf = async (receipt) => {
    try {
      toast.loading(`Downloading ${receipt.receiptNumber}...`, { id: 'pdf-dl' });
      const res = await API.get(`/admin/fees/${receipt._id}/pdf?download=1`, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', receipt.pdfFileName || `${receipt.receiptNumber}-Fee-Receipt.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('✓ PDF downloaded!', { id: 'pdf-dl' });
    } catch (err) {
      toast.error('Failed to download PDF', { id: 'pdf-dl' });
    }
  };

  // Share Receipt
  const handleShareReceipt = async (receipt) => {
    const category = FEE_TYPE_LABELS[receipt.receiptCategory || receipt.feeType] || 'Fee';
    const shareText = `Burhani Tutorials Official Fee Receipt\nReceipt No: ${receipt.receiptNumber}\nStudent: ${receipt.studentName}\nClass: Class ${receipt.classApplied}th (${receipt.branch})\nCategory: ${category}\nTotal Paid: ₹${receipt.amountPaid.toLocaleString('en-IN')}\nPayment Mode: ${receipt.paymentMode}\nDate: ${new Date(receipt.invoiceDate).toLocaleDateString('en-IN')}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Fee Receipt - ${receipt.receiptNumber}`, text: shareText });
        toast.success('Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') { navigator.clipboard.writeText(shareText); toast.success('📋 Copied to clipboard!'); }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success('📋 Receipt details copied to clipboard!');
    }
  };

  // Permanent Delete
  const handleConfirmDelete = async () => {
    if (!deleteReceipt) return;
    try {
      setIsDeleting(true);
      const res = await API.delete(`/admin/fees/${deleteReceipt._id}`);
      if (res.data.success) {
        toast.success(`✓ Receipt ${deleteReceipt.receiptNumber} deleted`);
        setDeleteReceipt(null);
        if (viewReceipt?._id === deleteReceipt._id) setViewReceipt(null);
        fetchReceipts();
      }
    } catch (err) {
      toast.error('Failed to delete receipt');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateDisplay = (d) => {
    if (!d) return '—';
    const date = new Date(d);
    if (isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const hasActiveFilters = search || feeTypeFilter !== 'ALL' || branch !== 'ALL' || classFilter !== 'ALL' || paymentMode !== 'ALL' || minAmount || maxAmount || dateFrom || dateTo;

  return (
    <AdminLayout
      title="Fee Management"
      subtitle="Record student fees, generate official PDF receipts &amp; track payments"
      actions={
        <button onClick={handleOpenGenerate} className="btn btn-primary fee-generate-btn" id="btn-generate-receipt">
          <span>➕</span> Generate Receipt
        </button>
      }
    >
      {/* ── 1. KPI SUMMARY CARDS ── */}
      <div className="fee-stats-grid">
        <div className="fee-stat-card fee-stat-total">
          <div className="fee-stat-icon">💰</div>
          <div className="fee-stat-content">
            <div className="fee-stat-amount">₹{summary.totalReceived.toLocaleString('en-IN')}</div>
            <div className="fee-stat-label">Total Collected</div>
            <div className="fee-stat-sub">{summary.totalReceipts} receipt{summary.totalReceipts !== 1 ? 's' : ''}</div>
          </div>
        </div>



        <div className="fee-stat-card fee-stat-receipts">
          <div className="fee-stat-icon">🧾</div>
          <div className="fee-stat-content">
            <div className="fee-stat-amount">{summary.totalReceipts}</div>
            <div className="fee-stat-label">Total Receipts</div>
            <div className="fee-stat-sub">All stored on server</div>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER ── */}
      <div className="fee-controls-card">
        {/* Search Row */}
        <div className="fee-search-row">
          <div className="fee-search-box">
            <span className="fee-search-icon">🔍</span>
            <input
              id="fee-search-input"
              type="text"
              placeholder="Search by student name or receipt no..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="form-control"
            />
            {search && (
              <button className="fee-clear-search" onClick={() => { setSearch(''); setPage(1); }}>✕</button>
            )}
          </div>

          <div className="fee-filter-actions">
            <button
              type="button"
              className={`btn btn-sm ${showAdvancedFilters ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              ⚙️ {showAdvancedFilters ? 'Hide Filters' : 'Filters'}
            </button>
            {hasActiveFilters && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleClearFilters}>
                ✕ Reset
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="fee-category-tabs">
          {/* Only showing Tuition Tab now */}
          <button
            type="button"
            className="fee-cat-pill active"
            onClick={() => { setFeeTypeFilter('ALL'); setPage(1); }}
          >
            🎓 Tuition Fees
          </button>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvancedFilters && (
          <div className="fee-advanced-drawer">
            <div className="fee-filter-field">
              <label>Branch</label>
              <select value={branch} onChange={(e) => { setBranch(e.target.value); setPage(1); }} className="form-control">
                <option value="ALL">All Branches</option>
                {BRANCHES.map(b => <option key={b.id} value={b.branchKey}>{b.shortName}</option>)}
              </select>
            </div>

            <div className="fee-filter-field">
              <label>Class</label>
              <select value={classFilter} onChange={(e) => { setClassFilter(e.target.value); setPage(1); }} className="form-control">
                <option value="ALL">All Classes</option>
                {CLASS_OPTIONS.map(c => <option key={c} value={c}>Class {c}th</option>)}
              </select>
            </div>

            <div className="fee-filter-field">
              <label>Payment Mode</label>
              <select value={paymentMode} onChange={(e) => { setPaymentMode(e.target.value); setPage(1); }} className="form-control">
                <option value="ALL">All Modes</option>
                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="fee-filter-field">
              <label>Amount Range (₹)</label>
              <div className="fee-range-inputs">
                <input type="number" placeholder="Min" value={minAmount} onChange={(e) => { setMinAmount(e.target.value); setPage(1); }} className="form-control" />
                <span className="fee-range-sep">–</span>
                <input type="number" placeholder="Max" value={maxAmount} onChange={(e) => { setMaxAmount(e.target.value); setPage(1); }} className="form-control" />
              </div>
            </div>

            <div className="fee-filter-field">
              <label>Date Range</label>
              <div className="fee-range-inputs">
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} className="form-control" />
                <span className="fee-range-sep">–</span>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} className="form-control" />
              </div>
            </div>

            <div className="fee-filter-field">
              <label>Sort By</label>
              <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setPage(1); }} className="form-control">
                <option value="createdAt">Date Created</option>
                <option value="invoiceDate">Invoice Date</option>
                <option value="amount">Amount</option>
                <option value="receiptNumber">Receipt No.</option>
                <option value="studentName">Student Name</option>
              </select>
            </div>

            <div className="fee-filter-field">
              <label>Order</label>
              <select value={sortOrder} onChange={(e) => { setSortOrder(e.target.value); setPage(1); }} className="form-control">
                <option value="desc">Newest / Highest</option>
                <option value="asc">Oldest / Lowest</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. RECEIPTS LIST ── */}
      <div className="card">
        {loading ? (
          <div className="fee-loading-state">
            <div className="spinner spinner-lg" />
            <p>Loading receipts...</p>
          </div>
        ) : receipts.length === 0 ? (
          <div className="fee-empty-state">
            <div className="fee-empty-icon">🧾</div>
            {summary.totalReceipts === 0 ? (
              <>
                <h3>No receipts yet</h3>
                <p>Generate your first official fee receipt to get started.</p>
                <button onClick={handleOpenGenerate} className="btn btn-primary">➕ Generate Receipt</button>
              </>
            ) : (
              <>
                <h3>No receipts match</h3>
                <p>Try adjusting your search filters.</p>
                <button onClick={handleClearFilters} className="btn btn-outline btn-sm">Clear Filters</button>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="table-wrapper fee-table-desktop">
              <table>
                <thead>
                  <tr>
                    <th>Receipt No.</th>
                    <th>Student</th>
                    <th>Class</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Mode</th>
                    <th>Date</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <span className="fee-receipt-no">{r.receiptNumber}</span>
                      </td>
                      <td>
                        <div className="fee-student-cell">
                          <span className="fee-student-name">{r.studentName}</span>
                          <span className="fee-student-branch">{r.branch}</span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-class">Class {r.classApplied}th</span>
                      </td>
                      <td>{getCategoryBadge(r)}</td>
                      <td>
                        <span className="fee-amount-cell">₹{r.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </td>
                      <td>
                        <span className="badge-mode">{r.paymentMode}</span>
                      </td>
                      <td>
                        <span className="fee-date-cell">{formatDateDisplay(r.invoiceDate)}</span>
                      </td>
                      <td>
                        <div className="table-action-btns" style={{ justifyContent: 'flex-end' }}>
                          <button className="action-btn-icon" onClick={() => setViewReceipt(r)} title="View">👁</button>
                          <button className="action-btn-icon" onClick={() => handleDownloadPdf(r)} title="Download PDF">📥</button>
                          <button className="action-btn-icon" onClick={() => handleShareReceipt(r)} title="Share">🔗</button>
                          <button className="action-btn-icon delete" onClick={() => setDeleteReceipt(r)} title="Delete">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="fee-cards-mobile">
              {receipts.map((r) => (
                <div key={r._id} className="fee-mobile-card">
                  <div className="fee-mc-top">
                    <span className="fee-receipt-no">{r.receiptNumber}</span>
                    {getCategoryBadge(r)}
                  </div>
                  <div className="fee-mc-student">{r.studentName}</div>
                  <div className="fee-mc-meta">
                    <span>Class {r.classApplied}th</span>
                    <span>•</span>
                    <span>{r.branch}</span>
                    <span>•</span>
                    <span>{r.paymentMode}</span>
                  </div>
                  <div className="fee-mc-bottom">
                    <div className="fee-mc-amount">₹{r.amountPaid.toLocaleString('en-IN')}</div>
                    <div className="fee-mc-date">{formatDateDisplay(r.invoiceDate)}</div>
                  </div>
                  <div className="fee-mc-actions">
                    <button className="btn btn-sm btn-outline" onClick={() => setViewReceipt(r)}>👁 View</button>
                    <button className="btn btn-sm btn-primary" onClick={() => handleDownloadPdf(r)}>📥 PDF</button>
                    <button className="btn btn-sm btn-ghost" onClick={() => handleShareReceipt(r)}>🔗</button>
                    <button className="btn btn-sm btn-ghost delete-btn-sm" onClick={() => setDeleteReceipt(r)}>🗑</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="table-pagination-footer">
              <div className="fee-pagination-info">
                {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of {pagination.total}
              </div>
              <div className="fee-pagination-btns">
                <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
                <span className="fee-page-indicator">Page {page} / {pagination.pages || 1}</span>
                <button className="btn btn-outline btn-sm" disabled={page >= pagination.pages} onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}>Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          MODAL 1: GENERATE RECEIPT WIZARD
         ══════════════════════════════════════════════════════ */}
      {generateModalOpen && (
        <div className="fee-modal-backdrop" onClick={() => !isSubmitting && setGenerateModalOpen(false)}>
          <div
            className={`fee-modal-container ${modalStep === 2 ? 'preview-mode' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="fee-modal-header">
              <div className="fee-modal-header-left">
                <div className="fee-modal-steps">
                  <span className={`step-dot ${modalStep === 1 ? 'active' : 'done'}`}>1</span>
                  <span className="step-line" />
                  <span className={`step-dot ${modalStep === 2 ? 'active' : ''}`}>2</span>
                </div>
                <div className="fee-modal-title">
                  {modalStep === 1 ? 'Enter Receipt Details' : 'Review & Confirm'}
                </div>
              </div>
              <button className="fee-modal-close" onClick={() => !isSubmitting && setGenerateModalOpen(false)}>✕</button>
            </div>

            {/* Modal Body */}
            <div className="fee-modal-body">
              {modalStep === 1 ? (
                /* STEP 1: FORM */
                <form id="fee-receipt-form" onSubmit={handleProceedToPreview}>

                  {/* SECTION 1: Student Info */}
                  <div className="form-section-card">
                    <div className="form-section-label">
                      <span className="form-section-num">1</span>
                      Student Information
                    </div>
                    <div className="fee-form-grid">
                      <div className="form-group form-group-full">
                        <label className="form-label">Student Full Name <span className="req">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mohammed Yusuf"
                          value={formData.studentName}
                          onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                          className="form-control form-control-lg"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Class / Grade <span className="req">*</span></label>
                        <select
                          required
                          value={formData.classApplied}
                          onChange={(e) => setFormData({ ...formData, classApplied: e.target.value })}
                          className="form-control"
                        >
                          {CLASS_OPTIONS.map(c => <option key={c} value={c}>Class {c}th</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Branch <span className="req">*</span></label>
                        <select
                          required
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="form-control"
                        >
                          {BRANCHES.map(b => <option key={b.id} value={b.branchKey}>{b.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Fee Items */}
                  <div className="form-section-card">
                    <div className="form-section-label">
                      <span className="form-section-num">2</span>
                      Fee Items
                      <span className="form-section-hint">You can add multiple fee types in one receipt</span>
                    </div>

                    <div className="fee-items-list">
                      {formData.feeItems.map((item, idx) => (
                        <div key={idx} className={`fee-item-row fee-item-row-${item.feeType === 'FORM_FEE' ? 'form' : 'tuition'}`}>
                          <div className="fee-item-row-header">
                            <span className={`fee-item-row-label ${item.feeType === 'FORM_FEE' ? 'label-form' : 'label-tuition'}`}>
                              {item.feeType === 'FORM_FEE' ? '📝' : '🎓'} Fee Item {idx + 1}
                            </span>
                            {formData.feeItems.length > 1 && (
                              <button type="button" className="fee-item-remove-btn" onClick={() => removeFeeItem(idx)}>
                                ✕ Remove
                              </button>
                            )}
                          </div>
                          <div className="fee-item-row-body">
                            <div className="form-group">
                              <label className="form-label">Fee Type <span className="req">*</span></label>
                              <select
                                value={item.feeType}
                                onChange={(e) => updateFeeItem(idx, 'feeType', e.target.value)}
                                className="form-control"
                              >
                                <option value="TUITION_FEE">🎓 Tuition Fees</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">Amount (₹) <span className="req">*</span></label>
                              <input
                                type="number"
                                step="0.01"
                                min="1"
                                required
                                placeholder="e.g. 5000"
                                value={item.amount}
                                onChange={(e) => updateFeeItem(idx, 'amount', e.target.value)}
                                className="form-control form-control-amount"
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Description <span className="form-optional">(optional)</span></label>
                              <input
                                type="text"
                                placeholder="e.g. Term 1, July batch..."
                                value={item.description}
                                onChange={(e) => updateFeeItem(idx, 'description', e.target.value)}
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      {formData.feeItems.length < 2 && (
                        <button
                          type="button"
                          className="fee-add-item-btn"
                          onClick={addFeeItem}
                        >
                          ➕ Add Another Fee Type
                        </button>
                      )}
                    </div>

                    {/* Live Total */}
                    {totalFeeAmount > 0 && (
                      <div className="fee-live-total">
                        <span>Grand Total:</span>
                        <span className="fee-live-total-amount">₹ {totalFeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <span className="fee-live-total-words">{numberToWordsClient(totalFeeAmount)}</span>
                      </div>
                    )}
                  </div>

                  {/* SECTION 3: Receipt Details */}
                  <div className="form-section-card">
                    <div className="form-section-label">
                      <span className="form-section-num">3</span>
                      Receipt Details
                    </div>
                    <div className="fee-form-grid">
                      <div className="form-group">
                        <label className="form-label">Receipt / Invoice No. <span className="req">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="BT-000001"
                          value={formData.receiptNumber}
                          onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
                          className="form-control form-control-mono"
                        />
                        <small className="form-hint">Auto-suggested. Edit if needed.</small>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Invoice Date <span className="req">*</span></label>
                        <input
                          type="date"
                          required
                          value={formData.invoiceDate}
                          onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Payment Mode <span className="req">*</span></label>
                        <select
                          required
                          value={formData.paymentMode}
                          onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                          className="form-control"
                        >
                          {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                      </div>
                      <div className="form-group form-group-full">
                        <label className="form-label">Remarks <span className="form-optional">(optional)</span></label>
                        <input
                          type="text"
                          placeholder="e.g. Cash received at front desk"
                          value={formData.remarks}
                          onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              ) : (
                /* STEP 2: PREVIEW */
                <ReceiptSheet data={formData} isFormData={true} />
              )}
            </div>

            {/* Modal Footer */}
            <div className="fee-modal-footer">
              {modalStep === 1 ? (
                <>
                  <button type="button" className="btn btn-ghost" onClick={() => setGenerateModalOpen(false)}>Cancel</button>
                  <button type="submit" form="fee-receipt-form" className="btn btn-primary fee-modal-next-btn">
                    Preview Receipt →
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="btn btn-outline" onClick={() => setModalStep(1)} disabled={isSubmitting}>
                    ← Edit Details
                  </button>
                  <button type="button" className="btn btn-primary fee-modal-next-btn" onClick={handleConfirmGenerate} disabled={isSubmitting}>
                    {isSubmitting ? 'Generating...' : '✓ Confirm & Generate'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 2: VIEW RECEIPT
         ══════════════════════════════════════════════════════ */}
      {viewReceipt && (
        <div className="fee-modal-backdrop" onClick={() => setViewReceipt(null)}>
          <div className="fee-modal-container preview-mode" onClick={(e) => e.stopPropagation()}>
            <div className="fee-modal-header">
              <div className="fee-modal-title">🧾 {viewReceipt.receiptNumber} — {viewReceipt.studentName}</div>
              <div className="fee-modal-header-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleDownloadPdf(viewReceipt)}>📥 Download</button>
                <button className="btn btn-outline btn-sm" onClick={() => handleShareReceipt(viewReceipt)}>🔗 Share</button>
                <button className="fee-modal-close" onClick={() => setViewReceipt(null)}>✕</button>
              </div>
            </div>

            <div className="fee-modal-body">
              <ReceiptSheet data={viewReceipt} isFormData={false} />
            </div>

            <div className="fee-modal-footer fee-modal-footer-spaced">
              <button
                type="button"
                className="btn btn-outline btn-danger-outline"
                onClick={() => setDeleteReceipt(viewReceipt)}
              >
                🗑 Delete Permanently
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-primary" onClick={() => handleDownloadPdf(viewReceipt)}>📥 Download PDF</button>
                <button type="button" className="btn btn-ghost" onClick={() => setViewReceipt(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MODAL 3: DELETE CONFIRMATION
         ══════════════════════════════════════════════════════ */}
      {deleteReceipt && (
        <div className="fee-modal-backdrop" onClick={() => !isDeleting && setDeleteReceipt(null)}>
          <div className="fee-modal-container delete-mode" onClick={(e) => e.stopPropagation()}>
            <div className="fee-modal-header fee-modal-header-danger">
              <div className="fee-modal-title">⚠️ Delete Receipt?</div>
              <button className="fee-modal-close" onClick={() => !isDeleting && setDeleteReceipt(null)}>✕</button>
            </div>

            <div className="fee-modal-body">
              <div className="delete-dialog-body">
                <div className="delete-warn-icon">🗑</div>
                <div className="delete-dialog-title">Permanently Delete Receipt?</div>
                <p className="delete-dialog-desc">This action cannot be undone. The DB record and PDF file will be erased.</p>

                <div className="delete-receipt-card">
                  <div className="delete-receipt-row"><span className="k">Receipt:</span><span className="v mono">{deleteReceipt.receiptNumber}</span></div>
                  <div className="delete-receipt-row"><span className="k">Student:</span><span className="v">{deleteReceipt.studentName}</span></div>
                  <div className="delete-receipt-row"><span className="k">Amount:</span><span className="v primary">₹{deleteReceipt.amountPaid.toLocaleString('en-IN')}</span></div>
                  <div className="delete-receipt-row"><span className="k">Category:</span><span className="v">{FEE_TYPE_LABELS[deleteReceipt.receiptCategory || deleteReceipt.feeType] || 'Fee'}</span></div>
                </div>
              </div>
            </div>

            <div className="fee-modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setDeleteReceipt(null)} disabled={isDeleting}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
