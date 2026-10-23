import { resolveNow, toYearMonth } from '../core/toDate';
import type { DateInput, YearInput } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * 闰年规则（需求 5.5）：能被 4 整除且不能被 100 整除，或能被 400 整除。
 */
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** 指定年份总天数：闰年 366，平年 365 */
function daysInYear(year: number): number {
  return isLeapYear(year) ? 366 : 365;
}

/**
 * 指定年月（1 基）的天数：`new Date(y, m, 0).getDate()` 即该月最后一天的"日"。
 * 例如 `new Date(2024, 2, 0)` = 2024-02-29 → `29`。
 */
function daysInMonth(year: number, month1: number): number {
  return new Date(year, month1, 0).getDate();
}

/**
 * 解析年份入参：支持 number / 纯数字字符串。
 * 非法值（如 `'abc'`、`NaN`、空串、`0`）一律回退到 `base` 的年份（默认今年），不抛错。
 */
function parseYear(year: YearInput | undefined, base: Date): number {
  if (typeof year === 'number') {
    return Number.isInteger(year) && year >= 1 ? year : base.getFullYear();
  }
  if (typeof year === 'string') {
    const trimmed = year.trim();
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (n >= 1) return n;
    }
  }
  return base.getFullYear();
}

/**
 * 获取**今年剩余天数**（不含今天，需求 2.2）。
 *
 * 即"今年 12 月 31 日零点"与"今天零点"的日序号差：
 * 今天是 12-31 时返回 `0`，今天是 12-30 时返回 `1`。
 *
 * @param baseDate - @internal 内部参数：注入基准时间（默认 `new Date()`），便于测试固定时间
 * @returns 今年剩余天数（不含今天）
 *
 * @example
 * ```ts
 * // 假设今天是 2023-03-10
 * getYearLastDays()  // 296
 * // 假设今天是 2023-12-31
 * getYearLastDays()  // 0
 * ```
 */
export function getYearLastDays(baseDate?: Date): number {
  const now = resolveNow(baseDate);
  const year = now.getFullYear();
  const endOfYear = new Date(year, 11, 31); // 今年 12 月 31 日零点
  const today = new Date(year, now.getMonth(), now.getDate()); // 今天零点
  // 零点对零点做毫秒差；Math.round 抵消夏令时带来的 ±1 小时偏差（需求 5.5）
  return Math.round((endOfYear.getTime() - today.getTime()) / MS_PER_DAY);
}

/**
 * 获取**指定年份的总天数**（365 / 366，需求 2.2）。
 *
 * @param year - 年份，支持 `number`（如 `2024`）或 `string`（如 `'2022'`）；
 *                省略或传入非法值（如 `'abc'`、`NaN`）时回退为**今年**，不抛错
 * @param baseDate - @internal 内部参数：注入基准时间（默认 `new Date()`），便于测试固定时间
 * @returns 该年总天数（闰年 366，平年 365）
 *
 * @example
 * ```ts
 * // 假设今年是 2023
 * getYearofDays()        // 365
 * getYearofDays('2022')  // 365
 * getYearofDays(2024)    // 366
 * getYearofDays('abc')   // 365（回退今年，不抛错）
 * ```
 */
export function getYearofDays(year?: YearInput, baseDate?: Date): number {
  const base = resolveNow(baseDate);
  return daysInYear(parseYear(year, base));
}

/**
 * 获取**指定日期所在月份的天数**（需求 2.2）。
 *
 * @param date - 日期，支持 `'YYYY-MM'`、`'YYYY-MM-DD'` 及斜杠变体
 *               （`'YYYY/MM'`、`'YYYY/MM/DD'`），也支持 `Date` 对象；
 *               省略或非法时回退为**本月**，不抛错（只取年月，忽略日部分）
 * @param baseDate - @internal 内部参数：注入基准时间（默认 `new Date()`），便于测试固定时间
 * @returns 该月份天数（28 / 29 / 30 / 31）
 *
 * @example
 * ```ts
 * // 假设本月是 2023-03
 * getDays()               // 31
 * getDays('2023-02')      // 28
 * getDays('2024-02')      // 29
 * getDays('2024-02-15')   // 29（只取年月）
 * getDays('2023/02')      // 28（斜杠兼容）
 * getDays('abc')          // 31（回退本月，不抛错）
 * ```
 */
export function getDays(date?: DateInput, baseDate?: Date): number {
  const base = resolveNow(baseDate);
  const ym = toYearMonth(date);
  if (ym) return daysInMonth(ym.year, ym.month);
  return daysInMonth(base.getFullYear(), base.getMonth() + 1); // 非法回退本月
}
