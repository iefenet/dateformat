/**
 * 偏移字符串判定：可选正负号 + 纯数字，允许首尾空白（兼容旧工具，需求 1.2）。
 */
const OFFSET_RE = /^\s*([+-]?\d+)\s*$/;

/**
 * 判断字符串是否为"相对今天偏移 N 天"的偏移字符串。
 *
 * @param s - 待判断的值
 * @returns 是偏移字符串返回 `true`
 *
 * @example
 * ```ts
 * isOffsetString('-7')    // true
 * isOffsetString(' -7 ')  // true（允许空格）
 * isOffsetString('+3')    // true
 * isOffsetString('0')     // true
 * isOffsetString('YYYY-MM-DD') // false（是模板）
 * ```
 */
export function isOffsetString(s: unknown): boolean {
  return typeof s === 'string' && OFFSET_RE.test(s);
}

/**
 * 解析偏移字符串为天数；非偏移字符串（或非字符串）返回 `null`（需求 5.3）。
 *
 * @param s - 待解析的字符串
 *
 * @example
 * ```ts
 * parseOffset('-7')   // -7
 * parseOffset(' +3 ') // 3
 * parseOffset('YYYY') // null
 * ```
 */
export function parseOffset(s?: string): number | null {
  if (typeof s !== 'string') return null;
  const m = OFFSET_RE.exec(s);
  return m ? Number.parseInt(m[1], 10) : null;
}

/**
 * 相对基准日期偏移 N 天（N 可为负）。
 *
 * 实现说明（语义选择，需求十一：多种方案时以示例语义为准并注明理由）：
 * 需求 5.3 括号中提到"时分秒归零"，但验收示例（需求 1.5）
 * `format(' -7 ', 'Y年M月D日 YYYY/MM/DD a')` 在当前时间 15:00 时期望输出
 * `…2023/03/03 下午`，且 1.2 中 `format('0')` 标注为"当前时间"——
 * 说明旧工具在偏移时**保留了当天时分秒**，仅平移"日"。
 * 因此本实现按组件构造新日期：日期加减 N 天，时/分/秒原样保留。
 *
 * @param base - 基准时间
 * @param days - 偏移天数（正为未来，负为过去）
 *
 * @example
 * ```ts
 * // 假设 base = 2023-03-10 15:00:00
 * applyOffset(base, -7) // 2023-03-03 15:00:00
 * applyOffset(base, 3)  // 2023-03-13 15:00:00
 * ```
 */
export function applyOffset(base: Date, days: number): Date {
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + days,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
  );
}
