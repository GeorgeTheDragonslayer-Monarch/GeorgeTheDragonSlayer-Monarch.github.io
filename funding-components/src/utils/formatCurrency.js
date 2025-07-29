/**
 * Currency formatting utilities
 * Dreams Uncharted Platform
 */

// Default currency configuration
const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

// Currency symbols mapping
const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  CNY: '¥',
  INR: '₹',
  BRL: 'R$',
  MXN: '$',
  KRW: '₩',
  RUB: '₽',
  ZAR: 'R',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  SEK: 'kr',
  DKK: 'kr',
  CHF: 'CHF',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  HRK: 'kn',
  TRY: '₺',
  ILS: '₪',
  AED: 'د.إ',
  SAR: 'ر.س',
  QAR: 'ر.ق',
  KWD: 'د.ك',
  BHD: '.د.ب',
  OMR: 'ر.ع.',
  JOD: 'د.ا',
  LBP: 'ل.ل',
  EGP: 'ج.م',
  MAD: 'د.م.',
  TND: 'د.ت',
  DZD: 'د.ج',
  LYD: 'ل.د',
  SDG: 'ج.س.',
  ETB: 'Br',
  KES: 'KSh',
  UGX: 'USh',
  TZS: 'TSh',
  RWF: 'RF',
  GHS: 'GH₵',
  NGN: '₦',
  XOF: 'CFA',
  XAF: 'FCFA',
  MGA: 'Ar',
  MUR: '₨',
  SCR: '₨',
  BWP: 'P',
  SZL: 'L',
  LSL: 'L',
  NAD: 'N$',
  ZMW: 'ZK',
  ZWL: 'Z$',
  MWK: 'MK',
  MZN: 'MT',
  AOA: 'Kz',
  CVE: '$',
  GMD: 'D',
  GNF: 'FG',
  LRD: 'L$',
  SLL: 'Le',
  STD: 'Db',
  SHP: '£',
  WST: 'T',
  TOP: 'T$',
  VUV: 'VT',
  FJD: 'FJ$',
  SBD: 'SI$',
  PGK: 'K',
  NCF: '₣',
  XPF: '₣'
};

/**
 * Format currency amount with proper localization
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code (default: USD)
 * @param {string} locale - Locale for formatting (default: en-US)
 * @param {object} options - Additional formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (
  amount, 
  currency = DEFAULT_CURRENCY, 
  locale = DEFAULT_LOCALE,
  options = {}
) => {
  // Handle invalid inputs
  if (amount === null || amount === undefined || isNaN(amount)) {
    return formatCurrency(0, currency, locale, options);
  }

  // Convert to number if string
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Default formatting options
  const defaultOptions = {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  };

  try {
    return new Intl.NumberFormat(locale, defaultOptions).format(numericAmount);
  } catch (error) {
    // Fallback formatting if Intl.NumberFormat fails
    console.warn('Currency formatting failed, using fallback:', error);
    return fallbackFormatCurrency(numericAmount, currency);
  }
};

/**
 * Fallback currency formatting for unsupported locales/currencies
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted currency string
 */
const fallbackFormatCurrency = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
  const formattedAmount = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // For most currencies, symbol comes before the amount
  if (['EUR', 'NOK', 'SEK', 'DKK'].includes(currency.toUpperCase())) {
    return `${formattedAmount} ${symbol}`;
  }
  
  return `${symbol}${formattedAmount}`;
};

/**
 * Format currency with compact notation (K, M, B)
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} Compact formatted currency string
 */
export const formatCurrencyCompact = (
  amount, 
  currency = DEFAULT_CURRENCY, 
  locale = DEFAULT_LOCALE
) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return formatCurrency(0, currency, locale);
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Use compact notation for large amounts
  if (Math.abs(numericAmount) >= 1000) {
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency.toUpperCase(),
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(numericAmount);
    } catch (error) {
      // Fallback for compact notation
      return formatCurrencyCompactFallback(numericAmount, currency);
    }
  }

  return formatCurrency(numericAmount, currency, locale);
};

/**
 * Fallback compact currency formatting
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency code
 * @returns {string} Compact formatted currency string
 */
const formatCurrencyCompactFallback = (amount, currency) => {
  const symbol = CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
  
  if (Math.abs(amount) >= 1000000000) {
    return `${symbol}${(amount / 1000000000).toFixed(1)}B`;
  } else if (Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  } else if (Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  
  return formatCurrency(amount, currency);
};

/**
 * Format currency without symbol (numbers only)
 * @param {number} amount - The amount to format
 * @param {string} locale - Locale for formatting
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatCurrencyNumber = (
  amount, 
  locale = DEFAULT_LOCALE, 
  decimals = 2
) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(numericAmount);
  } catch (error) {
    return numericAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Parsed amount
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0;
  }

  // Remove currency symbols and spaces
  const cleanString = currencyString
    .replace(/[^\d.,\-]/g, '')
    .replace(/,/g, '');

  const parsed = parseFloat(cleanString);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Get currency symbol for a given currency code
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency) => {
  return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency.toUpperCase();
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const numericValue = typeof value === 'string' ? parseFloat(value) : value;
  return `${numericValue.toFixed(decimals)}%`;
};

/**
 * Format funding progress
 * @param {number} current - Current amount raised
 * @param {number} target - Target amount
 * @param {string} currency - Currency code
 * @returns {object} Formatted progress information
 */
export const formatFundingProgress = (current, target, currency = DEFAULT_CURRENCY) => {
  const currentAmount = current || 0;
  const targetAmount = target || 0;
  const percentage = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;
  const remaining = Math.max(0, targetAmount - currentAmount);

  return {
    current: formatCurrency(currentAmount, currency),
    target: formatCurrency(targetAmount, currency),
    remaining: formatCurrency(remaining, currency),
    percentage: formatPercentage(percentage),
    percentageValue: percentage,
    isCompleted: currentAmount >= targetAmount,
    progressRatio: targetAmount > 0 ? Math.min(currentAmount / targetAmount, 1) : 0
  };
};

/**
 * Validate currency amount
 * @param {any} amount - Amount to validate
 * @param {number} min - Minimum allowed amount
 * @param {number} max - Maximum allowed amount
 * @returns {object} Validation result
 */
export const validateCurrencyAmount = (amount, min = 0, max = Infinity) => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numericAmount)) {
    return {
      isValid: false,
      error: 'Invalid amount format'
    };
  }
  
  if (numericAmount < min) {
    return {
      isValid: false,
      error: `Amount must be at least ${formatCurrency(min)}`
    };
  }
  
  if (numericAmount > max) {
    return {
      isValid: false,
      error: `Amount cannot exceed ${formatCurrency(max)}`
    };
  }
  
  return {
    isValid: true,
    amount: numericAmount
  };
};

// Export all functions as default
export default {
  formatCurrency,
  formatCurrencyCompact,
  formatCurrencyNumber,
  parseCurrency,
  getCurrencySymbol,
  formatPercentage,
  formatFundingProgress,
  validateCurrencyAmount
};

