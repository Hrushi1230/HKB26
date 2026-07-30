/**
 * Quantize a float to 3 decimals.
 *
 * Trigonometric results (Math.cos/sin/sqrt) can differ in their last binary
 * digit between the Node.js server render and the browser's client render,
 * which React reports as a hydration attribute mismatch on SVG coordinates.
 * Rounding to a fixed precision makes the two renders byte-identical while
 * staying far more precise than any viewBox needs.
 */
export function quant(n: number): number {
  return Math.round(n * 1000) / 1000
}
