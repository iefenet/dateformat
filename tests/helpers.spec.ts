import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDays, getYearLastDays, getYearofDays } from '../src/index';

/** 基准日期：2023-03-10（平年，3 月 31 天），与需求 2.3 保持一致 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

describe('helpers —— 2.3 验收用例（基准 2023-03-10）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getYearLastDays() → 296（3/10 → 12/31，不含今天）', () => {
    expect(getYearLastDays()).toBe(296);
  });

  it('getYearofDays() → 365（2023 平年）', () => {
    expect(getYearofDays()).toBe(365);
  });

  it('getYearofDays() - getYearLastDays() → 69（今年已过去）', () => {
    expect(getYearofDays() - getYearLastDays()).toBe(69);
  });

  it('getYearofDays("2022") → 365', () => {
    expect(getYearofDays('2022')).toBe(365);
  });

  it('getYearofDays(2024) → 366', () => {
    expect(getYearofDays(2024)).toBe(366);
  });

  it('getDays() → 31（本月 3 月）', () => {
    expect(getDays()).toBe(31);
  });

  it('getDays("2023-02") → 28', () => {
    expect(getDays('2023-02')).toBe(28);
  });

  it('getDays("2024-02") → 29', () => {
    expect(getDays('2024-02')).toBe(29);
  });
});

describe('helpers —— 7.2 补充：非法入参回退且不抛错', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getYearofDays("abc") → 回退今年 365（不抛错）', () => {
    expect(() => getYearofDays('abc')).not.toThrow();
    expect(getYearofDays('abc')).toBe(365);
  });

  it('getYearofDays 空串 / NaN / 0 → 回退今年 365', () => {
    expect(getYearofDays('')).toBe(365);
    expect(getYearofDays(Number.NaN)).toBe(365);
    expect(getYearofDays(0)).toBe(365);
  });

  it('getDays("abc") → 回退本月 31（不抛错）', () => {
    expect(() => getDays('abc')).not.toThrow();
    expect(getDays('abc')).toBe(31);
  });

  it('getDays("2023-13") 月份越界 → 回退本月 31', () => {
    expect(getDays('2023-13')).toBe(31);
  });

  it('getDays(无效 Date) → 回退本月 31', () => {
    expect(getDays(new Date('not a date'))).toBe(31);
  });
});

describe('helpers —— 7.2 补充：格式与边界', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('getDays("2024-02-15") → 29（只取年月）', () => {
    expect(getDays('2024-02-15')).toBe(29);
  });

  it('getDays("2023/02") → 28（斜杠兼容）', () => {
    expect(getDays('2023/02')).toBe(28);
  });

  it('getDays("2024/02/15") → 29（斜杠完整日期）', () => {
    expect(getDays('2024/02/15')).toBe(29);
  });

  it('getDays(Date 对象) → 29', () => {
    expect(getDays(new Date(2024, 1, 15))).toBe(29);
  });

  it('大小月：1/3/5/7/8/10/12 月 31 天，4/6/9/11 月 30 天', () => {
    expect(getDays('2023-01')).toBe(31);
    expect(getDays('2023-04')).toBe(30);
    expect(getDays('2023-06')).toBe(30);
    expect(getDays('2023-09')).toBe(30);
    expect(getDays('2023-11')).toBe(30);
    expect(getDays('2023-08')).toBe(31);
    expect(getDays('2023-12')).toBe(31);
  });

  it('闰年规则：2000 → 366（被 400 整除），1900 → 365（被 100 整除不被 400 整除）', () => {
    expect(getYearofDays(2000)).toBe(366);
    expect(getYearofDays(1900)).toBe(365);
    expect(getYearofDays(' 2024 ')).toBe(366); // 允许首尾空格的字符串
  });

  it.each([
    ['2023-12-31', 0], // 今年已到最后一天
    ['2023-12-30', 1],
    ['2023-01-01', 364], // 平年首日之后到年底
    ['2024-02-29', 306], // 闰年：366 - 60
  ])('%s 时 getYearLastDays() → %s', (date, expected) => {
    const [y, m, d] = date.split('-').map(Number);
    vi.setSystemTime(new Date(y, m - 1, d, 23, 30, 0));
    expect(getYearLastDays()).toBe(expected);
  });
});

describe('helpers —— 用户 5 行 console 组合能全部跑通（7.2 第 8 条）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('输出与需求示例一致', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    // 与需求 2.3 的用户原示例逐字一致，无需改动
    console.log('今年剩余：' + getYearLastDays() + '天');
    console.log('今年已过去：' + (getYearofDays() - getYearLastDays()) + '天');
    console.log('2022年一共：' + getYearofDays('2022') + '天');
    console.log('本月一共：' + getDays() + '天');
    console.log('本月一共：' + getDays('2023-02') + '天');

    expect(log.mock.calls.map((call) => call[0])).toEqual([
      '今年剩余：296天',
      '今年已过去：69天',
      '2022年一共：365天',
      '本月一共：31天',
      '本月一共：28天',
    ]);
    log.mockRestore();
  });
});
