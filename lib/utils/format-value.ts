/**
 * Formats item values with appropriate decimal places
 * - Shows significant digits for very small values
 * - Shows 3 decimals for regular values
 * - Returns "0" for zero values
 */
export function formatValue(value: any): string {
  const num = typeof value === "number" ? value : Number(value)
  
  if (isNaN(num) || num === 0) return "0"
  
  // For extremely small values (less than 0.0001), show up to 6 decimal places
  if (num > 0 && num < 0.0001) {
    // Use toPrecision to show significant digits, then remove scientific notation
    const formatted = num.toPrecision(6)
    // Remove trailing zeros but keep at least one decimal place
    return formatted.replace(/\.?0+$/, (match) => match.includes('.') ? '' : match)
  }
  
  // For very small values (0.0001 - 0.001), show 5 decimal places
  if (num > 0 && num < 0.001) {
    return num.toFixed(5)
  }
  
  // For regular values, show 3 decimal places
  return num.toFixed(3)
}
