import { toDate } from '../core/toDate';
import type { DateInput } from '../types';

/**
 * 解析日期字符串为 `Date` 对象（把库内 iOS 兼容的解析能力公开）。
 *
 * 不依赖 `new Date(string)` 原生解析，而是用正则取出年月日时分秒后以组件形式构造，
 * 从根上规避 iOS Safari 上 `new Date('2024-01-01 12:00:00')` 返回 Invalid Date 的问题；
 * 并带**回写校验**：`'2023-02-31'` 这类会溢出为 3 月的输入直接判非法。
 *
 * 支持的字符串格式（日期与时间之间的分隔符 `-` / `/` 前后需一致）：
 * - `'YYYY-MM'`、`'YYYY/MM'`
 * - `'YYYY-MM-DD'`、`'YYYY/MM/DD'`
 * - 上述任意格式带时间部分：`'2024-01-01 12:00'`、`'2024-01-01T12:00:00'` 等
 *
 * @param input - 日期字符串或 `Date` 对象
 * @returns 合法日期返回 `Date`（传 `Date` 时返回同一时刻的**副本**）；非法输入返回 `null`（不抛错）
 *
 * @example
 * ```ts
 * parseDate('2024-02-15')           // 2024 年 2 月 15 日 0 点的 Date
 * parseDate('2024/02/15 10:30:00')  // 2024 年 2 月 15 日 10:30:00
 * parseDate('2024-01-01 12:00:00')  // iOS Safari 下同样可用
 * parseDate('2023-02-31')           // null（2 月没有 31 日，回写校验拦截）
 * parseDate('abc')                  // null
 * parseDate(undefined)              // null
 * ```
 */
export function parseDate(input?: DateInput | null): Date | null {
  return toDate(input);
}

/**
 * 判断输入是否为**可解析的合法日期**（{@link parseDate} 的布尔便捷形式）。
 *
 * @param input - 日期字符串或 `Date` 对象
 * @returns 可解析返回 `true`；`null` / `undefined` / 非法字符串 / Invalid Date 返回 `false`
 *
 * @example
 * ```ts
 * isValid('2024-02-29')       // true
 * isValid('2023-02-29')       // false（平年 2 月无 29 日）
 * isValid(new Date('x'))      // false（Invalid Date）
 * isValid(undefined)          // false
 * ```
 */
export function isValid(input?: DateInput | null): boolean {
  return toDate(input) !== null;
}
