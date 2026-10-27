import { pad } from '../utils/pad';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
 * 季度（token `Q`，1 基）：`3` 月 → `1`，`12` 月 → `4`。
 *
 * @example
 * ```ts
 * quarterOfYear(3)  // 1
 * quarterOfYear(12) // 4
 * ```
 */
export function quarterOfYear(month1: number): number {
  return Math.floor((month1 - 1) / 3) + 1;
}

/**
 * 年内第几天（token `DDD`，1 基）：1 月 1 日 → `1`，12 月 31 日 → `365` / `366`。
 * 按零点到零点计算，`Math.round` 抵消夏令时带来的 ±1 小时偏差。
 *
 * @example
 * ```ts
 * dayOfYear(new Date(2023, 2, 10))  // 69
 * dayOfYear(new Date(2023, 11, 31)) // 365
 * ```
 */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/**
 * ISO 8601 年内第几周（token `ww`）：**周一**为一周开始，
 * 包含当年**首个周四**的那一周为第 1 周，取值 1~53。
 *
 * 跨年边界说明：年末/年初的几天可能属于相邻年份的周
 * （如 2023-01-01 属于 2022 年第 52 周、2024-12-30 属于 2025 年第 1 周），
 * `ww` 只输出周序号本身，与同年渲染的 `YYYY` 可能差 1——需要严格对齐时请按 ISO 周历年处理。
 *
 * @example
 * ```ts
 * weekOfYear(new Date(2023, 2, 10))  // 10
 * weekOfYear(new Date(2023, 0, 1))   // 52（属于 2022 年的最后一周）
 * ```
 */
export function weekOfYear(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (d.getDay() + 6) % 7; // 周一=0 … 周日=6
  d.setDate(d.getDate() - day + 3); // 平移到本周周四（ISO 周以周四锚定所属年份）
  const firstThursday = new Date(d.getFullYear(), 0, 4); // 1 月 4 日必在第 1 周
  const fday = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - fday + 3); // 第 1 周的周四
  return 1 + Math.round((d.getTime() - firstThursday.getTime()) / (7 * MS_PER_DAY));
}

/**
 * token 匹配正则（需求 5.2）：
 * - 首个分支匹配 **字面量转义** `[...]`——方括号内的内容不作为 token 替换，脱去括号原样输出；
 * - 其余交替顺序按 token 长度**从长到短**排列，
 *   避免 `M` 抢先吞掉 `MM`、`EE` 吞掉 `EEE` 等情况。
 * 注意：`hh` 为 24 小时制、`ii` 为分钟（与 dayjs 风格相反，为兼容旧工具保留）。
 */
export const TOKEN_RE = /(?:\[[^\]]*\])|YYYY|SSS|EEE|DDD|EE|YY|MM|DD|ww|hh|ii|ss|Y|M|D|Q|H|a|i|s|x|X/g;

/**
 * 由日期生成 token → 替换值 的完整映射（需求 1.3 token 表 + 扩展 token）。
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
    SSS: pad(date.getMilliseconds(), 3),
    a: periodOfDay(hours),
    EEE: WEEK_FULL[week],
    EE: WEEK_SHORT[week],
    Q: String(quarterOfYear(month)),
    DDD: pad(dayOfYear(date), 3),
    ww: pad(weekOfYear(date), 2),
    x: String(date.getTime()),
    X: String(Math.floor(date.getTime() / 1000)),
  };
}
