/**
 * Formats item values with appropriate decimal places
 * - Shows 3 decimals for values >= 0.001
 * - Shows 5 decimals for very small values (0.0001 - 0.001)
 * - Returns "N/A" for null/undefined values
 * - Returns "0" for zero values
 */
export function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "N/A"
  }
  
  const num = typeof value === "number" ? value : Number(value)
  
  if (isNaN(num)) return "N/A"
  if (num === 0) return "0"
  
  // For very small values (less than 0.001), show 5 decimal places
  if (num > 0 && num < 0.001) {
    return num.toFixed(5)
  }
  
  // For regular values, show 3 decimal places
  return num.toFixed(3)
}
