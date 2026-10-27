import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isAfter, isBefore, isSameDay, isToday } from '../src/index';

/** 基准时间：2023-03-10 15:00:00（星期五），与 format.spec.ts 保持一致 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

describe('isToday —— 日粒度判断', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('同一天任意时刻都算今天（忽略时分秒）', () => {
    expect(isToday('2023-03-10')).toBe(true);
    expect(isToday('2023-03-10 23:59')).toBe(true);
    expect(isToday(new Date(2023, 2, 10, 0, 0, 1))).toBe(true);
  });

  it('相邻日期不算今天', () => {
    expect(isToday('2023-03-09 23:59')).toBe(false);
    expect(isToday('2023-03-11 00:00')).toBe(false);
  });

  it('非法或缺失输入返回 false（不抛错、不回退）', () => {
    expect(isToday('abc')).toBe(false);
    expect(isToday('2023-02-31')).toBe(false);
    expect(isToday(undefined)).toBe(false);
  });
});

describe('isSameDay —— 两日期同一天', () => {
  it('日粒度相等即可，时分秒不限', () => {
    expect(isSameDay('2023-03-10 08:00', '2023-03-10 23:59')).toBe(true);
    expect(isSameDay(new Date(2024, 0, 1, 6), '2024-01-01')).toBe(true);
  });

  it('不同天返回 false', () => {
    expect(isSameDay('2023-03-10', '2023-03-11')).toBe(false);
    expect(isSameDay('2023-02-28', '2023-03-01')).toBe(false);
  });

  it('任一输入非法或缺失返回 false（不抛错）', () => {
    expect(isSameDay('abc', '2023-03-10')).toBe(false);
    expect(isSameDay('2023-03-10')).toBe(false);
    expect(isSameDay()).toBe(false);
  });
});

describe('isBefore / isAfter —— 时刻粒度比较', () => {
  it('早于 / 晚于', () => {
    expect(isBefore('2023-03-09', '2023-03-10')).toBe(true);
    expect(isBefore('2023-03-10 08:00', '2023-03-10 09:00')).toBe(true); // 时刻粒度
    expect(isAfter('2023-03-11', '2023-03-10')).toBe(true);
    expect(isAfter('2023-03-10 09:00', '2023-03-10 08:00')).toBe(true);
  });

  it('相等时既不早于也不晚于', () => {
    expect(isBefore('2023-03-10', '2023-03-10')).toBe(false);
    expect(isAfter('2023-03-10 08:00', '2023-03-10 08:00')).toBe(false);
  });

  it('反向不成立', () => {
    expect(isBefore('2023-03-11', '2023-03-10')).toBe(false);
    expect(isAfter('2023-03-09', '2023-03-10')).toBe(false);
  });

  it('任一输入非法或缺失返回 false（不抛错）', () => {
    expect(isBefore('abc', '2023-03-10')).toBe(false);
    expect(isAfter('2023-03-10', 'abc')).toBe(false);
    expect(isBefore('2023-03-10')).toBe(false);
    expect(isAfter()).toBe(false);
  });
});
