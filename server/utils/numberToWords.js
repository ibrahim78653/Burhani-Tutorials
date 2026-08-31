/**
 * Converts a numeric amount into words formatted in Indian numbering format.
 * E.g., 145000 -> "Rupees One Lakh Forty Five Thousand Only"
 * E.g., 5000.75 -> "Rupees Five Thousand and Seventy Five Paise Only"
 */

const units = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];

const tens = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

function convertBelowThousand(num) {
  let str = '';
  if (num >= 100) {
    str += units[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  }
  if (num > 0) {
    str += units[num] + ' ';
  }
  return str.trim();
}

function numberToIndianWords(amount) {
  const num = Number(amount);
  if (isNaN(num) || num < 0) return 'Invalid Amount';
  if (num === 0) return 'Rupees Zero Only';

  const parts = num.toFixed(2).split('.');
  let integerPart = parseInt(parts[0], 10);
  const decimalPart = parseInt(parts[1], 10);

  if (integerPart === 0 && decimalPart === 0) {
    return 'Rupees Zero Only';
  }

  let words = '';

  // Crores (>= 1,00,00,000)
  if (integerPart >= 10000000) {
    const crore = Math.floor(integerPart / 10000000);
    words += convertBelowThousand(crore) + ' Crore ';
    integerPart %= 10000000;
  }

  // Lakhs (>= 1,00,000)
  if (integerPart >= 100000) {
    const lakh = Math.floor(integerPart / 100000);
    words += convertBelowThousand(lakh) + ' Lakh ';
    integerPart %= 100000;
  }

  // Thousands (>= 1,000)
  if (integerPart >= 1000) {
    const thousand = Math.floor(integerPart / 1000);
    words += convertBelowThousand(thousand) + ' Thousand ';
    integerPart %= 1000;
  }

  // Hundreds and remaining units (< 1,000)
  if (integerPart > 0) {
    words += convertBelowThousand(integerPart) + ' ';
  }

  words = words.trim();
  let result = words ? `Rupees ${words}` : '';

  if (decimalPart > 0) {
    const paiseWords = convertBelowThousand(decimalPart);
    if (result) {
      result += ` and ${paiseWords} Paise`;
    } else {
      result = `${paiseWords} Paise`;
    }
  }

  return `${result} Only`.replace(/\s+/g, ' ').trim();
}

module.exports = { numberToIndianWords };
