import { applyOffset, isOffsetString, parseOffset } from './offset';
import { TOKEN_RE, buildTokenMap } from './tokens';
import { resolveNow } from './toDate';

/**
 * 默认格式化模板（与旧工具一致，需求 5.1）。
 */
export const DEFAULT_PATTERN = 'YYYY-MM-DD hh:ii:ss';

/**
 * 按模板渲染日期：单次正则从长到短匹配 token，未知片段原样保留（需求 5.2）。
 */
function render(pattern: string, date: Date): string {
  const map = buildTokenMap(date);
  return pattern.replace(TOKEN_RE, (token) => map[token] ?? token);
}

/**
 * 格式化日期时间（完全兼容旧工具调用约定，老代码无需改动）。
 *
 * 调用形式：
 * - `format()` —— 当前时间，默认模板 `'YYYY-MM-DD hh:ii:ss'`
 * - `format(pattern)` —— 当前时间按模板格式化
 * - `format(offset, pattern)` —— 相对今天偏移 N 天后按模板格式化
 *
 * 偏移字符串（如 `'-7'`、`'0'`、`'+3'`、`'  -7 '`）表示相对今天偏移 N 天，
 * 仅平移日期、保留当天时分秒（与旧工具示例语义一致，见 1.5 的 `a` 示例）。
 * 非法输入不抛错：无法识别的参数按"模板"处理，模板中的非 token 字符原样保留。
 *
 * @param a - 偏移字符串或格式化模板
 * @param b - 格式化模板（与 `a` 同时传入时，`a` 只按偏移解析）
 * @param baseDate - @internal 内部参数：注入基准时间（默认 `new Date()`），便于测试固定时间
 * @returns 格式化后的字符串
 *
 * @example
 * ```ts
 * // 假设当前时间 2023-03-10 15:00:00（星期五）
 * format()                                  // '2023-03-10 15:00:00'
 * format('YYYY-MM-DD hh:ii:ss')             // '2023-03-10 15:00:00'
 * format('-7', 'YYYY-MM-DD')                // '2023-03-03'
 * format('+3', 'MM-DD')                     // '03-13'
 * format(' -7 ', 'Y年M月D日 YYYY/MM/DD a')  // '二零二三年三月三日 2023/03/03 下午'
 * format('Y年')                             // '二零二三年'
 * format('a')                               // '下午'
 * format('今天EE')                          // '今天周五'
 * ```
 */
export function format(a?: string, b?: string, baseDate?: Date): string {
  const now = resolveNow(baseDate);

  // 参数归一化（需求 5.1）
  let offsetDays: number | null = null;
  let pattern = DEFAULT_PATTERN;

  if (typeof b === 'string') {
    // 两个参数：第一个按偏移解析（解析失败则忽略、不视为模板），第二个是模板
    offsetDays = parseOffset(a);
    pattern = b;
  } else if (typeof a === 'string') {
    if (isOffsetString(a)) {
      // 只传一个参数且是偏移字符串 → offset=该值，pattern=默认模板
      offsetDays = parseOffset(a);
    } else {
      // 只传一个参数且非偏移 → 视为模板，时间取当前时间
      pattern = a;
    }
  }

  const base = offsetDays === null ? now : applyOffset(now, offsetDays);
  return render(pattern, base);
}
