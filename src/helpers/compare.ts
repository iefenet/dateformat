import { resolveNow, toDate } from '../core/toDate';
import type { DateInput } from '../types';

/**
 * 判定类函数的统一约定：**非法或缺失输入一律返回 `false`**，不做"回退当前时间"。
 * （回退会让 `isSameDay('abc', today)` 在今天恰好命中时返回 `true`，误导业务判断；
 * 值类函数 `format` / `getDays` 等仍保持库级回退约定。）
 */

/** 日粒度相等：年月日三个组件完全相同（忽略时分秒毫秒）。 */
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * 判断给定日期是否是**今天**（日粒度，忽略时分秒）。
 *
 * @param input - 日期：字符串或 `Date` 对象
 * @param baseDate - @internal 内部参数："今天"的基准（默认 `new Date()`），便于测试固定时间
 * @returns 是今天返回 `true`；非法或缺失输入返回 `false`（不抛错）
 *
 * @example
 * ```ts
 * // 假设今天是 2023-03-10
 * isToday('2023-03-10 23:59') // true（同一天即可）
 * isToday('2023-03-11')       // false
 * isToday('abc')              // false
 * ```
 */
export function isToday(input?: DateInput, baseDate?: Date): boolean {
  const now = resolveNow(baseDate);
  const d = toDate(input);
  return d !== null && sameDay(d, now);
}

/**
 * 判断两个日期是否为**同一天**（日粒度，忽略时分秒）。
 *
 * @param a - 日期一：字符串或 `Date` 对象
 * @param b - 日期二：字符串或 `Date` 对象
 * @returns 同一天返回 `true`；任一输入非法或缺失返回 `false`（不抛错）
 *
 * @example
 * ```ts
 * isSameDay('2023-03-10 08:00', '2023-03-10 23:59') // true
 * isSameDay('2023-03-10', '2023-03-11')             // false
 * isSameDay('abc', '2023-03-10')                    // false
 * ```
 */
export function isSameDay(a?: DateInput, b?: DateInput): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return da !== null && db !== null && sameDay(da, db);
}

/**
 * 判断 `a` 是否**早于** `b`（时刻粒度，精确到毫秒；相等返回 `false`）。
 *
 * @param a - 日期一：字符串或 `Date` 对象
 * @param b - 日期二：字符串或 `Date` 对象
 * @returns `a < b` 返回 `true`；任一输入非法或缺失返回 `false`（不抛错）
 *
 * @example
 * ```ts
 * isBefore('2023-03-09', '2023-03-10')             // true
 * isBefore('2023-03-10', '2023-03-10')             // false（相等不算早于）
 * isBefore('2023-03-10 08:00', '2023-03-10 09:00') // true（时刻粒度）
 * ```
 */
export function isBefore(a?: DateInput, b?: DateInput): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return da !== null && db !== null && da.getTime() < db.getTime();
}

/**
 * 判断 `a` 是否**晚于** `b`（时刻粒度，精确到毫秒；相等返回 `false`）。
 *
 * @param a - 日期一：字符串或 `Date` 对象
 * @param b - 日期二：字符串或 `Date` 对象
 * @returns `a > b` 返回 `true`；任一输入非法或缺失返回 `false`（不抛错）
 *
 * @example
 * ```ts
 * isAfter('2023-03-11', '2023-03-10') // true
 * isAfter('2023-03-10', '2023-03-10') // false（相等不算晚于）
 * ```
 */
export function isAfter(a?: DateInput, b?: DateInput): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return da !== null && db !== null && da.getTime() > db.getTime();
}
