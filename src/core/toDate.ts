import type { DateInput } from '../types';

/**
 * 完整日期字符串：`2024-01-01`、`2024/01/01`、`2024-01-01 12:00:00` 等。
 * 日期与时间之间的分隔符 `-` / `/` 前后需一致（通过反向引用约束）。
 */
const DATE_TIME_RE =
  /^(\d{4})([-/])(\d{1,2})(?:\2(\d{1,2}))?(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/;

/**
 * 年月字符串：`2023-02`、`2024/02/15` 等（仅取年月，允许尾随时间部分）。
 */
const YEAR_MONTH_RE = /^(\d{4})([-/])(\d{1,2})(?:\2\d{1,2})?(?:[ T].*)?$/;

/** 年月提取结果（月份为 1 基，取值 1~12） */
export interface YearMonth {
  year: number;
  /** 1 基月份（1~12） */
  month: number;
}

/**
 * 统一输入转 `Date`（含 iOS 兼容）。
 *
 * iOS Safari 中 `new Date('2024-01-01 12:00:00')` 会返回 `Invalid Date`，
 * 这里不依赖原生字符串解析，而是用正则取出年月日时分秒后以组件形式
 * 构造 `new Date(y, m - 1, d, …)`，从根上绕开该兼容问题。
 *
 * @param input - 日期字符串或 `Date` 对象
 * @returns 合法日期则返回 `Date`；非法输入返回 `null`（不抛错）
 *
 * @example
 * ```ts
 * toDate('2024-02-15')            // 2024 年 2 月 15 日 0 点
 * toDate('2024/02/15 10:30:00')   // 2024 年 2 月 15 日 10:30:00
 * toDate(new Date())              // 同一时刻的副本
 * toDate('abc')                   // null
 * toDate('2023-02-31')            // null（回写校验发现溢出为 3 月）
 * ```
 */
export function toDate(input?: DateInput | null): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  }
  if (typeof input !== 'string') return null;

  const m = DATE_TIME_RE.exec(input.trim());
  if (!m) return null;

  const year = Number(m[1]);
  const month = Number(m[3]); // 1 基
  const day = m[4] !== undefined ? Number(m[4]) : 1;
  const date = new Date(
    year,
    month - 1,
    day,
    m[5] !== undefined ? Number(m[5]) : 0,
    m[6] !== undefined ? Number(m[6]) : 0,
    m[7] !== undefined ? Number(m[7]) : 0,
  );

  // 回写校验：拦截 "2023-02-31" 这类会溢出为 3 月的输入
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

/**
 * 从输入中提取年月（**只取年月**，忽略日与时间，如 `'2024-02-15'` → `2024 / 2`）。
 *
 * 与 {@link toDate} 的区别：本函数对"日非法但年月合法"的输入仍然放行
 * （如 `'2024-02-31'`），因为调用方 `getDays` 只关心年月。
 *
 * @param input - 日期字符串或 `Date` 对象
 * @returns 月份在 1~12 之间时返回 `{ year, month }`，否则 `null`
 *
 * @example
 * ```ts
 * toYearMonth('2024-02-15')  // { year: 2024, month: 2 }
 * toYearMonth('2023/02')     // { year: 2023, month: 2 }
 * toYearMonth('2023-13')     // null（月份越界）
 * toYearMonth('abc')         // null
 * ```
 */
export function toYearMonth(input?: DateInput | null): YearMonth | null {
  const full = toDate(input);
  if (full) return { year: full.getFullYear(), month: full.getMonth() + 1 };

  if (input instanceof Date) return null; // 无效的 Date 实例，直接判非法

  if (typeof input === 'string') {
    const m = YEAR_MONTH_RE.exec(input.trim());
    if (m) {
      const month = Number(m[3]);
      if (month >= 1 && month <= 12) {
        return { year: Number(m[1]), month };
      }
    }
  }
  return null;
}

/**
 * 解析内部基准时间：`baseDate` 为合法 `Date` 时使用它，否则取当前时间。
 *
 * 需求三.6：内部实现支持注入 `baseDate?: Date`（默认 `new Date()`），
 * 便于在测试中固定时间；对外暴露的公开函数仍保持旧签名
 * （追加的可选末位参数不影响旧调用）。
 */
export function resolveNow(baseDate?: Date): Date {
  return baseDate instanceof Date && !Number.isNaN(baseDate.getTime())
    ? baseDate
    : new Date();
}
