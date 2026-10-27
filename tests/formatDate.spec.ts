import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate } from '../src/index';

/** 基准时间：2023-03-10 15:00:00，与 format.spec.ts 保持一致 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

describe('formatDate —— 格式化任意日期', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('字符串日期 + 默认模板', () => {
    expect(formatDate('2024-02-29')).toBe('2024-02-29 00:00:00');
  });

  it('字符串日期 + 自定义模板（斜杠与时间部分）', () => {
    expect(formatDate('2024/02/15 10:30:00', 'MM-DD hh:ii')).toBe('02-15 10:30');
    expect(formatDate('2024-02-15 9:05', 'YYYY/MM/DD hh:ii:ss')).toBe('2024/02/15 09:05:00');
  });

  it('Date 对象', () => {
    expect(formatDate(new Date(2020, 1, 29, 8, 30, 5), 'YYYY-MM-DD hh:ii:ss')).toBe(
      '2020-02-29 08:30:05',
    );
  });

  it('中文 token 同样可用', () => {
    expect(formatDate('2023-03-10', 'Y年M月D日')).toBe('二零二三年三月十日');
  });

  it('扩展 token 同样可用（Q / DDD / ww / SSS / 转义）', () => {
    expect(formatDate('2023-03-10', '[第]Q季度 DDD')).toBe('第1季度 069');
  });

  it('偏移能力留给 format / DateFmt：formatDate 不解析偏移字符串', () => {
    // '-7' 不是合法日期 → 回退当前时间（与 getDays 回退本月同约定）
    expect(formatDate('-7', 'YYYY-MM-DD')).toBe('2023-03-10');
  });

  it('非法入参回退当前时间（不抛错）', () => {
    expect(formatDate('abc')).toBe('2023-03-10 15:00:00');
    expect(formatDate('2023-02-31', 'YYYY-MM-DD')).toBe('2023-03-10');
    expect(formatDate(new Date('x'))).toBe('2023-03-10 15:00:00');
  });

  it('缺省入参 = 当前时间', () => {
    expect(formatDate()).toBe('2023-03-10 15:00:00');
  });

  it('空模板返回空串（与 format 一致）', () => {
    expect(formatDate('2024-01-01', '')).toBe('');
  });
});
