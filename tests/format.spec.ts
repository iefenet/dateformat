import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { format } from '../src/index';

/**
 * 基准时间：2023-03-10 15:00:00（星期五），与需求 1.5 保持一致。
 * 全部用本地时间组件构造，测试不依赖运行机器的时区。
 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

/** 把系统时间固定到指定本地时间（月为 1 基） */
function atTime(year: number, month: number, day: number, hour = 15, minute = 0, second = 0) {
  vi.setSystemTime(new Date(year, month - 1, day, hour, minute, second));
}

describe('format —— 1.5 验收用例逐条覆盖', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    // [调用参数, 期望输出]
    [['YYYY-MM-DD hh:ii:ss'], '2023-03-10 15:00:00'],
    [['-7', 'YYYY-MM-DD'], '2023-03-03'],
    [['YYYY-MM-01'], '2023-03-01'],
    [['YYYY年MM月DD日'], '2023年03月10日'],
    [['Y年'], '二零二三年'],
    [['M月'], '三月'],
    [['D日'], '十日'],
    [['a'], '下午'],
    [['今天EEE'], '今天星期五'],
    [['今天EE'], '今天周五'],
    [[' -7 ', 'Y年M月D日 YYYY/MM/DD a'], '二零二三年三月三日 2023/03/03 下午'],
    [['hh:ii:ss'], '15:00:00'],
    [['hh:ii:ss a'], '15:00:00 下午'],
    [[], '2023-03-10 15:00:00'],
  ])('format(%s) → %s', (args, expected) => {
    expect(format(...args)).toBe(expected);
  });

  it('模板固定字符保留：format("YYYY-MM-01") → "2023-03-01"', () => {
    expect(format('YYYY-MM-01')).toBe('2023-03-01');
  });
});

describe('format —— 偏移字符串（7.1 补充）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('带空格的负偏移：format(" -7 ", "YYYY-MM-DD")', () => {
    expect(format(' -7 ', 'YYYY-MM-DD')).toBe('2023-03-03');
  });

  it('正偏移未来日期：format("+3", "MM-DD")', () => {
    expect(format('+3', 'MM-DD')).toBe('03-13');
  });

  it('"0" 即当前时间（偏移仅平移日期、保留时分秒，与 1.2 / 1.5 示例一致）', () => {
    expect(format('0')).toBe('2023-03-10 15:00:00');
  });

  it('只传偏移时使用默认模板', () => {
    expect(format('-7')).toBe('2023-03-03 15:00:00');
  });

  it('负偏移跨月：format("-15", "YYYY-MM-DD")', () => {
    expect(format('-15', 'YYYY-MM-DD')).toBe('2023-02-23');
  });

  it('正偏移跨月', () => {
    atTime(2023, 3, 1, 9, 5, 0);
    expect(format('+40', 'YYYY-MM-DD')).toBe('2023-04-10');
  });

  it('正偏移跨年', () => {
    atTime(2023, 12, 31, 23, 59, 59);
    expect(format('+1', 'YYYY-MM-DD')).toBe('2024-01-01');
  });
});

describe('format —— 非法输入不抛错（7.1 补充）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('format("abc") 不抛错（模板中的 "a" 是 token，其余原样保留）', () => {
    expect(() => format('abc')).not.toThrow();
    expect(typeof format('abc')).toBe('string');
  });

  it('format("abc", "YYYY") 不抛错：第一参数非偏移被忽略，按第二参数格式化当前时间', () => {
    expect(() => format('abc', 'YYYY')).not.toThrow();
    expect(format('abc', 'YYYY')).toBe('2023');
  });

  it('空模板返回空字符串', () => {
    expect(format('')).toBe('');
  });

  it('未知 token 原样保留', () => {
    expect(format('X YYYY')).toBe('X 2023');
  });
});

describe('format —— 中文大写边界（7.1 补充）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [1, '一月'],
    [2, '二月'],
    [9, '九月'],
    [10, '十月'],
    [11, '十一月'],
    [12, '十二月'],
  ])('%i 月 → M月 = %s', (month, expected) => {
    atTime(2023, month, 15);
    expect(format('M月')).toBe(expected);
  });

  it.each([
    [1, '一日'],
    [9, '九日'],
    [10, '十日'],
    [11, '十一日'],
    [19, '十九日'],
    [20, '二十日'],
    [21, '二十一日'],
    [29, '二十九日'],
    [30, '三十日'],
    [31, '三十一日'],
  ])('%i 日 → D日 = %s', (day, expected) => {
    atTime(2023, 1, day);
    expect(format('D日')).toBe(expected);
  });

  it.each([
    [2020, '二零二零'],
    [2023, '二零二三'],
    [2030, '二零三零'],
    [1999, '一九九九'],
  ])('%i 年 → Y = %s', (year, expected) => {
    atTime(year, 6, 15);
    expect(format('Y')).toBe(expected);
  });
});

describe('format —— 时段边界（7.1 补充）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [0, '凌晨'],
    [5, '凌晨'],
    [6, '早上'],
    [8, '早上'],
    [9, '上午'],
    [11, '上午'],
    [12, '中午'],
    [13, '下午'],
    [15, '下午'],
    [17, '下午'],
    [18, '晚上'],
    [23, '晚上'],
  ])('%i 点 → a = %s', (hour, expected) => {
    atTime(2023, 3, 10, hour);
    expect(format('a')).toBe(expected);
  });
});

describe('format —— 星期 EEE / EE 七天全测（7.1 补充）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['2023-03-05', '星期日', '周日'],
    ['2023-03-06', '星期一', '周一'],
    ['2023-03-07', '星期二', '周二'],
    ['2023-03-08', '星期三', '周三'],
    ['2023-03-09', '星期四', '周四'],
    ['2023-03-10', '星期五', '周五'],
    ['2023-03-11', '星期六', '周六'],
  ])('%s：EEE = %s / EE = %s', (date, eee, ee) => {
    const [y, m, d] = date.split('-').map(Number);
    atTime(y, m, d);
    expect(format('EEE')).toBe(eee);
    expect(format('EE')).toBe(ee);
  });
});

describe('format —— 其余 token（YY / H / i / s / hh 24 小时制）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('YY：两位年', () => {
    expect(format('YY')).toBe('23');
    atTime(2005, 6, 1);
    expect(format('YY')).toBe('05');
  });

  it('H / i / s：不补零', () => {
    atTime(2023, 3, 10, 15, 0, 0);
    expect(format('H:i:s')).toBe('15:0:0');
  });

  it('hh 是 24 小时制（凌晨 0 点 → "00"）', () => {
    atTime(2023, 3, 10, 0, 5, 9);
    expect(format('hh:ii:ss')).toBe('00:05:09');
  });

  it('hh 23 点 59 分 59 秒', () => {
    atTime(2023, 3, 10, 23, 59, 59);
    expect(format('hh:ii:ss')).toBe('23:59:59');
  });

  it('YYYY 不足四位时补零', () => {
    atTime(501, 3, 10, 15, 0, 0);
    expect(format('YYYY')).toBe('0501');
  });
});
