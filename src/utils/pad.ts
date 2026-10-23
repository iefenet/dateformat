/**
 * 数字前补零（不足目标长度时在前面补 `0`）。
 *
 * @param n - 目标数字（小数会被截断）
 * @param len - 目标最小长度，默认 `2`
 * @returns 补零后的字符串，负数保留负号
 *
 * @example
 * ```ts
 * pad(3)      // '03'
 * pad(3, 4)   // '0003'
 * pad(2023)   // '2023'
 * pad(-5)     // '-5'
 * ```
 */
export function pad(n: number, len = 2): string {
  const num = Math.trunc(n);
  const sign = num < 0 ? '-' : '';
  const digits = String(Math.abs(num));
  const zeros = len > digits.length ? '0'.repeat(len - digits.length) : '';
  return sign + zeros + digits;
}
