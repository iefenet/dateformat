import { DEFAULT_PATTERN, render } from '../core/format';
import { resolveNow, toDate } from '../core/toDate';
import type { DateInput } from '../types';

/**
 * 格式化**任意日期**（`format` 只能格式化"今天 ± N 天"，本函数补齐该空缺）。
 *
 * 与 {@link ../core/format!format} 的分工：
 * - `format` —— 面向旧约定：只接受偏移字符串 / 模板，基准恒为"今天"；
 * - `formatDate` —— 面向新代码：直接给一个日期（字符串或 `Date`），想格式化哪天就格式化哪天。
 *
 * 非法入参不抛错：入参缺失或无法解析（如 `'abc'`、`'2023-02-31'`）时回退为**当前时间**。
 *
 * @param input - 日期：`'YYYY-MM-DD'`、`'YYYY/MM/DD hh:ii:ss'` 等字符串或 `Date` 对象
 *                （iOS Safari 兼容的组件式解析，见 {@link parseDate}）
 * @param pattern - 格式化模板，默认 `'YYYY-MM-DD hh:ii:ss'`（与 `format` 一致）
 * @param baseDate - @internal 内部参数：回退用的基准时间（默认 `new Date()`），便于测试固定时间
 * @returns 格式化后的字符串
 *
 * @example
 * ```ts
 * formatDate('2024-02-29')                    // '2024-02-29 00:00:00'
 * formatDate('2024/02/15 10:30:00', 'MM-DD hh:ii') // '02-15 10:30'
 * formatDate(new Date(), 'Y年M月D日')          // '二零二六年十月二十六日'（以当天为例）
 * formatDate('abc', 'YYYY-MM-DD')             // 回退当前时间，如 '2026-10-26'
 * ```
 */
export function formatDate(
  input?: DateInput,
  pattern: string = DEFAULT_PATTERN,
  baseDate?: Date,
): string {
  const now = resolveNow(baseDate);
  const date = toDate(input) ?? now; // 非法回退当前时间（与 getDays 回退本月同约定）
  return render(pattern, date);
}
