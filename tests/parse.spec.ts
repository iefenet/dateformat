import { describe, expect, it } from 'vitest';
import { isValid, parseDate } from '../src/index';

describe('parseDate —— iOS 兼容解析', () => {
  it('标准日期字符串（默认日为 1、时间为 0 点）', () => {
    const d = parseDate('2024-02-15')!;
    expect([d.getFullYear(), d.getMonth() + 1, d.getDate()]).toEqual([2024, 2, 15]);
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([0, 0, 0]);
  });

  it('带时间部分：空格与 T 分隔均可', () => {
    const d = parseDate('2024-01-01T12:30:45')!;
    expect([d.getHours(), d.getMinutes(), d.getSeconds()]).toEqual([12, 30, 45]);
    const d2 = parseDate('2024-01-01 12:30:45')!;
    expect(d2.getTime()).toBe(d.getTime());
  });

  it('iOS Safari 失败场景：new Date("2024-01-01 12:00:00") 的组件式解析', () => {
    const d = parseDate('2024-01-01 12:00:00')!;
    expect(d.getFullYear()).toBe(2024);
    expect(d.getHours()).toBe(12);
  });

  it('斜杠格式与不补零的月日', () => {
    const d = parseDate('2024/2/5')!;
    expect(d.getMonth() + 1).toBe(2);
    expect(d.getDate()).toBe(5);
  });

  it('传 Date 返回同一时刻的副本（不返回原对象）', () => {
    const src = new Date(2020, 0, 1, 9, 30, 0);
    const copy = parseDate(src)!;
    expect(copy.getTime()).toBe(src.getTime());
    expect(copy).not.toBe(src);
  });

  it('非法输入返回 null（不抛错）', () => {
    expect(parseDate('2023-02-31')).toBeNull(); // 回写校验：2 月没有 31 日
    expect(parseDate('2023-13-01')).toBeNull(); // 月份越界
    expect(parseDate('abc')).toBeNull();
    expect(parseDate('')).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate(new Date('not a date'))).toBeNull();
  });
});

describe('isValid —— 布尔便捷形式', () => {
  it('合法输入', () => {
    expect(isValid('2024-02-29')).toBe(true);
    expect(isValid('2024/01/01 12:00')).toBe(true);
    expect(isValid(new Date())).toBe(true);
  });

  it('非法输入', () => {
    expect(isValid('2023-02-29')).toBe(false); // 平年 2 月无 29 日
    expect(isValid('abc')).toBe(false);
    expect(isValid(undefined)).toBe(false);
    expect(isValid(new Date('x'))).toBe(false);
  });
});
