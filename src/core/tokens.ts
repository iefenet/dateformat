import { pad } from '../utils/pad';

/**
 * 中文数字映射（需求 1.4：0零 1一 2二 3三 4四 5五 6六 7七 8八 9九）。
 */
const CN_DIGITS = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const;

/** 星期全称，下标与 `Date#getDay()` 对齐（0 = 星期日） */
const WEEK_FULL = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
] as const;

/** 星期简称，下标与 `Date#getDay()` 对齐（0 = 周日） */
const WEEK_SHORT = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'] as const;

/**
 * 1~39 的中文数字（覆盖 1~12 月与 1~31 日）：
 * 1→一 … 9→九，10→十，11→十一 … 19→十九，20→二十，21→二十一 … 31→三十一。
 */
function numberToCn(n: number): string {
  if (n < 10) return CN_DIGITS[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const tensPart = tens === 1 ? '十' : CN_DIGITS[tens] + '十';
  return ones === 0 ? tensPart : tensPart + CN_DIGITS[ones];
}

/**
 * 年份逐位转中文（token `Y`）：`2023` → `二零二三`，`2020` → `二零二零`。
 *
 * @example
 * ```ts
 * yearToCn(2023) // '二零二三'
 * yearToCn(1999) // '一九九九'
 * ```
 */
export function yearToCn(year: number): string {
  return String(year).replace(/\d/g, (digit) => CN_DIGITS[Number(digit)]);
}

/**
 * 月份转中文数字（token `M`，1 基）：`3` → `三`，`11` → `十一`。
 *
 * 语义说明：需求 1.4 的映射写作"1→一月 … 12→十二月"，但验收示例（1.5）
 * `format('M月')` → `'三月'`、`format(' -7 ', 'Y年M月D日…')` → `'…三月三日…'`
 * 表明 `M` 只输出中文数字本身，"月"字来自模板——否则会得到"三月月"。
 * 本实现以验收示例为准。
 *
 * @example
 * ```ts
 * monthToCn(1)  // '一'
 * monthToCn(10) // '十'
 * monthToCn(12) // '十二'
 * ```
 */
export function monthToCn(month: number): string {
  return numberToCn(month);
}

/**
 * 日期转中文数字（token `D`，1 基）：`10` → `十`，`21` → `二十一`。
 * "日"字来自模板（同 {@link monthToCn} 的语义说明）。
 *
 * @example
 * ```ts
 * dayToCn(1)  // '一'
 * dayToCn(20) // '二十'
 * dayToCn(31) // '三十一'
 * ```
 */
export function dayToCn(day: number): string {
  return numberToCn(day);
}

/**
 * 时段（token `a`），按 24 小时制小时划分（需求 1.4）：
 * 0~5 凌晨、6~8 早上、9~11 上午、12 中午、13~17 下午、18~23 晚上。
 *
 * @example
 * ```ts
 * periodOfDay(15) // '下午'
 * periodOfDay(0)  // '凌晨'
 * periodOfDay(12) // '中午'
 * ```
 */
export function periodOfDay(hour: number): string {
  if (hour <= 5) return '凌晨';
  if (hour <= 8) return '早上';
  if (hour <= 11) return '上午';
  if (hour === 12) return '中午';
  if (hour <= 17) return '下午';
  return '晚上';
}

/**
 * token 匹配正则（需求 5.2）：交替顺序按 token 长度**从长到短**排列，
 * 避免 `M` 抢先吞掉 `MM`、`EE` 吞掉 `EEE` 等情况。
 * 注意：`hh` 为 24 小时制、`ii` 为分钟（与 dayjs 风格相反，为兼容旧工具保留）。
 */
export const TOKEN_RE = /EEE|EE|YYYY|YY|Y|MM|M|DD|D|hh|H|ii|i|ss|s|a/g;

/**
 * 由日期生成 token → 替换值 的完整映射（需求 1.3 token 表）。
 *
 * @param date - 待格式化的日期
 *
 * @example
 * ```ts
 * // 2023-03-10 15:00:00 星期五
 * buildTokenMap(date)['YYYY'] // '2023'
 * buildTokenMap(date)['hh']   // '15'
 * buildTokenMap(date)['a']    // '下午'
 * ```
 */
export function buildTokenMap(date: Date): Record<string, string> {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1 基
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const week = date.getDay();

  return {
    YYYY: pad(year, 4),
    YY: pad(year % 100, 2),
    Y: yearToCn(year),
    MM: pad(month, 2),
    M: monthToCn(month),
    DD: pad(day, 2),
    D: dayToCn(day),
    // hh 为 24 小时制补零、ii 为分钟（兼容旧工具约定，勿改成 dayjs 风格）
    hh: pad(hours, 2),
    H: String(hours),
    ii: pad(minutes, 2),
    i: String(minutes),
    ss: pad(seconds, 2),
    s: String(seconds),
    a: periodOfDay(hours),
    EEE: WEEK_FULL[week],
    EE: WEEK_SHORT[week],
  };
}
