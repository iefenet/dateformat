import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { diff, fromNow } from '../src/index';

/** 基准时间：2023-03-10 15:00:00（星期五），与 format.spec.ts 保持一致 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

describe('fromNow —— 相对时间描述', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('不足 1 分钟：过去/未来统一为"刚刚"', () => {
    expect(fromNow(new Date(BASE.getTime() + 30_000))).toBe('刚刚');
    expect(fromNow(new Date(BASE.getTime() - 59_000))).toBe('刚刚');
    expect(fromNow(new Date(BASE.getTime()))).toBe('刚刚');
  });

  it('分钟档：N 分钟前 / 后', () => {
    expect(fromNow('2023-03-10 14:30')).toBe('30 分钟前');
    expect(fromNow('2023-03-10 15:30')).toBe('30 分钟后');
    expect(fromNow('2023-03-10 15:59')).toBe('59 分钟后');
  });

  it('小时档：满 60 分钟进档', () => {
    expect(fromNow('2023-03-10 13:00')).toBe('2 小时前');
    expect(fromNow('2023-03-11 14:00')).toBe('23 小时后');
    expect(fromNow('2023-03-10 15:01')).toBe('1 分钟后'); // 不满 1 小时留在分钟档
  });

  it('天档：满 24 小时进档', () => {
    expect(fromNow('2023-03-09 15:00')).toBe('1 天前');
    expect(fromNow('2023-02-09 16:00')).toBe('28 天前'); // 28 天 23 小时，向零取整
    expect(fromNow('2023-02-09 15:00')).toBe('29 天前');
  });

  it('月档：30 天近似换算', () => {
    expect(fromNow('2023-02-08 15:00')).toBe('1 个月前'); // 恰 30 天
    expect(fromNow('2022-04-10 15:00')).toBe('11 个月前'); // 334 天 → 11 个月
  });

  it('年档：365 天近似换算，364 天按 1 年计', () => {
    expect(fromNow('2022-03-11 15:00')).toBe('1 年前'); // 364 天 → 12 个月档顶，按 1 年
    expect(fromNow('2022-03-10 15:00')).toBe('1 年前'); // 恰 365 天
    expect(fromNow('2013-03-10 15:00')).toBe('10 年前');
    expect(fromNow('2024-03-10 15:00')).toBe('1 年后');
  });

  it('非法或缺失输入返回空字符串（不抛错、不误报"刚刚"）', () => {
    expect(fromNow('abc')).toBe('');
    expect(fromNow('2023-02-31')).toBe('');
    expect(fromNow(undefined)).toBe('');
  });
});

describe('diff —— 时间单位（精确时长，向零取整）', () => {
  it('day：默认单位，a - b', () => {
    expect(diff('2024-03-01', '2024-01-01')).toBe(60); // 31 + 29（闰年）
    expect(diff('2024-01-01', '2024-03-01')).toBe(-60); // 顺序反转为负
    expect(diff('2024-03-01', '2024-03-01')).toBe(0);
  });

  it('hour / minute / second / ms', () => {
    expect(diff('2024-03-01 12:00', '2024-03-01 10:30', 'hour')).toBe(1); // 1.5h 截断
    expect(diff('2024-03-01 10:00:00', '2024-03-01 09:59:01', 'minute')).toBe(0);
    expect(diff('2024-03-01 10:00:00', '2024-03-01 09:59:59', 'second')).toBe(1);
    expect(diff(new Date(2024, 2, 1, 0, 0, 0, 5), new Date(2024, 2, 1, 0, 0, 0, 0), 'ms')).toBe(5);
  });

  it('跨零点但不足 24 小时按 day 为 0（精确时长语义）', () => {
    expect(diff('2024-03-02 01:00', '2024-03-01 23:00', 'day')).toBe(0);
  });
});

describe('diff —— 日历单位（只统计满整月 / 整周年）', () => {
  it('month：满整月', () => {
    expect(diff('2024-03-01', '2024-01-01', 'month')).toBe(2);
    expect(diff('2024-02-15', '2023-02-20', 'month')).toBe(11); // 差 5 天不满 12 个月
    expect(diff('2024-03-10', '2024-03-10', 'month')).toBe(0);
  });

  it('month 月末钳制：1-31 → 2-29（闰）算满 1 个月，→ 2-28 不算', () => {
    expect(diff('2024-02-29', '2024-01-31', 'month')).toBe(1);
    expect(diff('2024-02-28', '2024-01-31', 'month')).toBe(0);
  });

  it('year：满整周年', () => {
    expect(diff('2024-03-10', '2000-03-10', 'year')).toBe(24);
    expect(diff('2024-03-10', '2000-03-15', 'year')).toBe(23); // 未满整周年
    expect(diff('2000-03-10', '2024-03-10', 'year')).toBe(-24);
  });
});

describe('diff —— 非法入参回退当前时间（不抛错）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('双边非法 → 0', () => {
    expect(diff('abc')).toBe(0);
    expect(diff('abc', 'def', 'month')).toBe(0);
  });

  it('单边非法按 now 参与计算', () => {
    expect(diff('abc', '2023-03-05 15:00:00')).toBe(5);
    expect(diff('2023-03-20 15:00:00', 'abc')).toBe(10);
  });
});
