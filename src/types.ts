/**
 * date-kit 公共类型定义。
 *
 * @packageDocumentation
 */

/**
 * 年份入参类型：支持数字或纯数字字符串（如 `2024` / `'2024'`）。
 *
 * 供 {@link ../helpers/dateInfo!getYearofDays} 使用。
 */
export type YearInput = number | string;

/**
 * 日期入参类型：支持日期字符串或 `Date` 对象。
 *
 * 字符串支持 `'YYYY-MM'`、`'YYYY-MM-DD'` 及斜杠变体 `'YYYY/MM'`、`'YYYY/MM/DD'`，
 * 允许带时间部分（如 `'2024-02-15 10:30'`）。
 *
 * 供 {@link ../helpers/dateInfo!getDays} 使用。
 */
export type DateInput = string | Date;
