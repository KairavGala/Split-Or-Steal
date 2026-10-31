/**
 * Master Money Pool of 60+ varied values between ₹0.25 and ₹500.
 */
export const MASTER_MONEY_POOL: number[] = [
  // Low values: ₹0.25 - ₹50 (~60% of total pool)
  0.25, 0.50, 0.75, 1.00, 2.00, 3.50, 5.00, 6.90, 8.00, 10.00,
  11.00, 12.50, 15.00, 18.00, 20.00, 22.00, 25.00, 28.50, 30.00, 33.00,
  35.00, 37.50, 40.00, 42.00, 44.00, 45.00, 48.00, 50.00, 0.10, 4.20,
  7.50, 14.00, 16.50, 24.00, 32.00, 49.00,

  // Medium values: ₹50 - ₹250 (~25% of total pool)
  55.00, 60.00, 67.00, 67.70, 69.00, 75.00, 77.00, 88.00, 90.00, 100.00,
  111.00, 120.00, 123.00, 143.00, 150.00, 175.00, 187.00, 200.00, 222.00, 240.00,
  250.00,

  // High values: ₹250 - ₹500 (~15% of total pool)
  269.00, 280.00, 300.00, 333.00, 350.00, 375.00, 400.00, 420.00, 444.00, 450.00,
  480.00, 500.00
];

/**
 * Helper to pick N money values randomly from pool (without duplicates if possible, or fresh shuffle).
 */
export function getRandomMoneyValues(count: number): number[] {
  const shuffled = [...MASTER_MONEY_POOL].sort(() => Math.random() - 0.5);
  if (count <= shuffled.length) {
    return shuffled.slice(0, count);
  }
  // If more requested than pool length, repeat shuffle
  const result: number[] = [];
  while (result.length < count) {
    const fresh = [...MASTER_MONEY_POOL].sort(() => Math.random() - 0.5);
    result.push(...fresh);
  }
  return result.slice(0, count);
}

/**
 * Format currency in Indian Rupees ₹.
 * Displays clean whole numbers without unnecessary .00, but keeps decimals like ₹0.25 or ₹6.90.
 */
export function formatRupees(amount: number): string {
  if (Number.isInteger(amount)) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  // Check if 2 decimals max needed
  const fixed = amount.toFixed(2);
  // remove trailing zero if e.g. 6.90 -> 6.90 is fine, but check
  return `₹${parseFloat(fixed).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
