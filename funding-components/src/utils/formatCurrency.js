// Simple currency formatting utility
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '$0.00';
  const num = parseFloat(amount);
  if (isNaN(num)) return '$0.00';
  return '$' + num.toFixed(2);
}

export default formatCurrency;

