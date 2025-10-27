/**
 * Return a random integer between min and max (inclusive).
 * If min > max their values are swapped. Non-integer inputs are rounded.
 *
 * Examples:
 *   randInt(1, 3) // 1 | 2 | 3
 *   randInt(5)    // 0..5
 */
export function randInt(min = 0, max = 1): number {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

export default randInt;
