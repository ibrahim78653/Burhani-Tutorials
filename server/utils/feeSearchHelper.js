/**
 * Search and fuzzy typo-tolerant helper utilities for Fee Management
 */

function normalizeString(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, ' ') // replace punctuation with spaces
    .replace(/\s+/g, ' ');      // collapse whitespace
}

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a, b) {
  if (!a || !b) return (a || b || '').length;
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[m][n];
}

/**
 * Creates MongoDB regex variations to catch common vowel substitutions, missing vowels, and doubled consonants
 * e.g. "Mohamd" -> matches "Mohammed", "Mohammad", "Mohamad"
 * e.g. "Ahmad" -> matches "Ahmed", "Ahamed"
 */
function generateTypoRegex(term) {
  const clean = term.toLowerCase().trim();
  if (clean.length < 2) return clean;

  const words = clean.split(/\s+/).filter(Boolean);
  const wordPatterns = words.map(w => {
    const consonants = [];
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      if (/[aeiouy]/.test(ch)) {
        // vowel
      } else if (/[a-z]/.test(ch)) {
        // consonant - collapse adjacent identical consonants
        if (consonants.length === 0 || consonants[consonants.length - 1] !== ch) {
          consonants.push(ch);
        }
      }
    }

    if (consonants.length >= 2) {
      // Build pattern: optional vowel -> consonant+ -> optional vowel -> consonant+ ...
      return consonants.map(c => `[aeiouy]*${c}+`).join('') + '[aeiouy]*';
    }

    return w.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
  });

  return wordPatterns.join('.*');
}

/**
 * Builds the MongoDB query object for fee receipts filtering & searching
 */
function buildFeeReceiptQuery(params) {
  const {
    search,
    feeType,
    branch,
    classFilter,
    paymentMode,
    amount,
    minAmount,
    maxAmount,
    invoiceDate,
    dateFrom,
    dateTo,
  } = params;

  const query = { isArchived: false };

  // 1. Search Query (Typo-tolerant student name + receipt number)
  if (search && search.trim()) {
    const rawSearch = search.trim();
    const normalized = normalizeString(rawSearch);
    const tokens = normalized.split(' ').filter(Boolean);

    const conditions = [];

    // Receipt number matching (exact or substring)
    conditions.push({ receiptNumber: { $regex: rawSearch, $options: 'i' } });

    // Exact or substring student name
    conditions.push({ studentName: { $regex: rawSearch, $options: 'i' } });
    conditions.push({ studentNameNormalized: { $regex: normalized, $options: 'i' } });

    // Multi-token AND search (e.g. "Ahmed" and "Khan")
    if (tokens.length > 1) {
      const tokenConditions = tokens.map(token => ({
        studentNameNormalized: { $regex: token, $options: 'i' }
      }));
      conditions.push({ $and: tokenConditions });
    }

    // Typo-tolerant phonetic/vowel regex
    const typoPattern = generateTypoRegex(rawSearch);
    if (typoPattern && typoPattern !== rawSearch.toLowerCase()) {
      try {
        conditions.push({ studentNameNormalized: { $regex: typoPattern, $options: 'i' } });
      } catch (e) {
        // Fallback safely if regex pattern has issue
      }
    }

    // Also match numeric amount if search string is purely numeric
    const searchNumber = parseFloat(rawSearch);
    if (!isNaN(searchNumber) && searchNumber > 0) {
      conditions.push({ amountPaid: searchNumber });
    }

    query.$or = conditions;
  }

  // 2. Fee Category Filter (supports new receiptCategory and old feeType)
  if (feeType && feeType !== 'ALL') {
    // Match against receiptCategory (new) or feeType (old) for backward compat
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { receiptCategory: feeType },
        { feeType: feeType }, // backward compat for old records
      ],
    });
  }

  // 3. Branch Filter
  if (branch && branch !== 'ALL') {
    query.branch = branch;
  }

  // 4. Class Filter
  if (classFilter && classFilter !== 'ALL') {
    query.classApplied = classFilter;
  }

  // 5. Payment Mode Filter
  if (paymentMode && paymentMode !== 'ALL') {
    query.paymentMode = paymentMode;
  }

  // 6. Amount Filters (Exact or Range)
  if (amount !== undefined && amount !== '' && !isNaN(parseFloat(amount))) {
    query.amountPaid = parseFloat(amount);
  } else if (
    (minAmount !== undefined && minAmount !== '' && !isNaN(parseFloat(minAmount))) ||
    (maxAmount !== undefined && maxAmount !== '' && !isNaN(parseFloat(maxAmount)))
  ) {
    query.amountPaid = {};
    if (minAmount !== undefined && minAmount !== '' && !isNaN(parseFloat(minAmount))) {
      query.amountPaid.$gte = parseFloat(minAmount);
    }
    if (maxAmount !== undefined && maxAmount !== '' && !isNaN(parseFloat(maxAmount))) {
      query.amountPaid.$lte = parseFloat(maxAmount);
    }
  }

  // 7. Date Filters (Exact Invoice Date or Range)
  if (invoiceDate) {
    const start = new Date(invoiceDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(invoiceDate);
    end.setHours(23, 59, 59, 999);
    query.invoiceDate = { $gte: start, $lte: end };
  } else if (dateFrom || dateTo) {
    query.invoiceDate = {};
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      query.invoiceDate.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      query.invoiceDate.$lte = to;
    }
  }

  return query;
}

module.exports = {
  normalizeString,
  levenshteinDistance,
  generateTypoRegex,
  buildFeeReceiptQuery,
};
