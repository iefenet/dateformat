import { resolveNow, toDate } from '../core/toDate';
import type { DateInput, DiffUnit } from '../types';

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;

/**
 * 在 `base` 基础上加 `months` 个月（月末钳制）：`2024-01-31` + 1 月 → `2024-02-29`。
 * 时分秒毫秒原样保留。
 */
function addMonthsClamped(base: Date, months: number): Date {
  const target = new Date(
    base.getFullYear(),
    base.getMonth() + months,
    1,
    base.getHours(),
    base.getMinutes(),
    base.getSeconds(),
    base.getMilliseconds(),
  );
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(base.getDate(), lastDay));
  return target;
}

/**
 * 日历月差：先按"年差 × 12 + 月差"粗算，再校验是否满整月——
 * `a` 早于 `base + months 个月`（月末钳制）则未满，回退 1。
 */
function diffMonths(a: Date, b: Date): number {
  let months = (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
  if (months > 0 && a.getTime() < addMonthsClamped(b, months).getTime()) months -= 1;
  if (months < 0 && a.getTime() > addMonthsClamped(b, months).getTime()) months += 1;
  return months;
}

/** 日历年差：按满整年校验（等价于月差 ÷ 12 的完整周年数）。 */
function diffYears(a: Date, b: Date): number {
  let years = a.getFullYear() - b.getFullYear();
  if (years > 0 && a.getTime() < addMonthsClamped(b, years * 12).getTime()) years -= 1;
  if (years < 0 && a.getTime() > addMonthsClamped(b, years * 12).getTime()) years += 1;
  return years;
}

/**
 * 相对时间描述（中文口语）：`'刚刚'`、`'3 分钟前'`、`'2 天后'`、`'5 个月前'`、`'1 年前'`。
 *
 * 阈值规则（按**已过去的时长**就近取档，月/年为 `30` / `365` 天的近似换算）：
 *
 * | 距今 | 输出 |
 * | --- | --- |
 * | < 1 分钟 | `'刚刚'`（过去/未来同文案） |
 * | < 1 小时 | `'N 分钟前'` / `'N 分钟后'` |
 * | < 1 天 | `'N 小时前'` / `'N 小时后'` |
 * | < 30 天 | `'N 天前'` / `'N 天后'` |
 * | < 12 个月（≈ 365 天） | `'N 个月前'` / `'N 个月后'` |
 * | 更久 | `'N 年前'` / `'N 年后'` |
 *
 * @param input - 目标日期：字符串或 `Date` 对象（解析规则同 {@link parseDate}）；
 *                非法或缺失输入返回**空字符串**（无法给出有意义的相对描述，不抛错、不回退"刚刚"）
 * @param baseDate - @internal 内部参数："现在"的基准（默认 `new Date()`），便于测试固定时间
 * @returns 中文相对时间描述
 *
 * @example
 * ```ts
 * // 假设当前时间 2023-03-10 15:00:00
 * fromNow(new Date())        // '刚刚'
 * fromNow('2023-03-10 14:30') // '30 分钟前'
 * fromNow('2023-03-11 15:00') // '1 天后'
 * fromNow('2022-03-10 15:00') // '1 年前'
 * fromNow('abc')             // ''
 * ```
 */
export function fromNow(input?: DateInput, baseDate?: Date): string {
  const now = resolveNow(baseDate);
  const target = toDate(input);
  if (!target) return ''; // 非法输入无相对语义，返回空串而非误导性的"刚刚"

  const elapsed = target.getTime() - now.getTime();
  const abs = Math.abs(elapsed);
  if (abs < MS_PER_MINUTE) return '刚刚';

  const suffix = elapsed < 0 ? '前' : '后';
  const minutes = Math.trunc(abs / MS_PER_MINUTE);
  if (minutes < 60) return `${minutes} 分钟${suffix}`;
  const hours = Math.trunc(minutes / 60);
  if (hours < 24) return `${hours} 小时${suffix}`;
  const days = Math.trunc(hours / 24);
  if (days < 30) return `${days} 天${suffix}`;
  const months = Math.trunc(days / 30);
  if (months < 12) return `${months} 个月${suffix}`;
  // 到达该档位至少 365 天，近似换算不足 1 年时按 1 年计
  return `${Math.max(1, Math.trunc(days / 365))} 年${suffix}`;
}

/**
 * 计算两个日期的差值 `a - b`（按指定单位，**向零取整**，负数表示 `a` 早于 `b`）。
 *
 * 单位语义：
 * - `'ms'` / `'second'` / `'minute'` / `'hour'` / `'day'`：精确时间差换算后截断
 *   （如相差 1.5 小时按 `'hour'` 得 `1`；跨零点但不足 24 小时按 `'day'` 得 `0`）；
 * - `'month'` / `'year'`：**日历**差值，只统计满整月 / 整周年的部分
 *   （月末按钳制规则，`2024-01-31` → `2024-02-29` 算满 1 个月，→ `2024-02-28` 不算）。
 *
 * 非法入参不抛错：`a` / `b` 缺失或无法解析时回退为**当前时间**（同 `getDays` 的回退约定）。
 *
 * @param a - 被减数日期（字符串或 `Date`）
 * @param b - 减数日期（字符串或 `Date`）
 * @param unit - 差值单位，默认 `'day'`
 * @param baseDate - @internal 内部参数：回退与默认基准（默认 `new Date()`），便于测试固定时间
 * @returns 差值数值（`a - b`，向零取整）
 *
 * @example
 * ```ts
 * diff('2024-03-01', '2024-01-01')            // 60（天）
 * diff('2024-01-01', '2024-03-01')            // -60（顺序反过来得负数）
 * diff('2024-03-01 12:00', '2024-03-01 10:30', 'hour') // 1
 * diff('2024-03-01', '2024-01-01', 'month')   // 2
 * diff('2024-02-15', '2023-02-20', 'year')    // 0（未满整周年）
 * diff('2024-03-10', '2000-03-10', 'year')    // 24
 * ```
 */
export function diff(
  a?: DateInput,
  b?: DateInput,
  unit: DiffUnit = 'day',
  baseDate?: Date,
): number {
  const now = resolveNow(baseDate);
  const dateA = toDate(a) ?? now;
  const dateB = toDate(b) ?? now;
  const ms = dateA.getTime() - dateB.getTime();

  switch (unit) {
    case 'ms':
      return ms;
    case 'second':
      return Math.trunc(ms / MS_PER_SECOND);
    case 'minute':
      return Math.trunc(ms / MS_PER_MINUTE);
    case 'hour':
      return Math.trunc(ms / MS_PER_HOUR);
    case 'day':
      return Math.trunc(ms / MS_PER_DAY);
    case 'month':
      return diffMonths(dateA, dateB);
    case 'year':
      return diffYears(dateA, dateB);
  }
}
