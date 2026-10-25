import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DateFmt, datefmt, format } from '../src/index';

/**
 * 基准时间：2023-03-10 15:00:00（星期五），与 format.spec.ts 保持一致。
 */
const BASE = new Date(2023, 2, 10, 15, 0, 0);

describe('datefmt 命名空间（Facade 模式）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('命名空间上的函数与具名导出是同一实现', () => {
    expect(datefmt.format).toBe(format);
    expect(datefmt.format('-7', 'YYYY-MM-DD')).toBe('2023-03-03');
    expect(datefmt.getDays('2024-02')).toBe(29);
    expect(datefmt.getYearofDays(2024)).toBe(366);
    expect(datefmt.getYearLastDays()).toBe(296);
  });

  it('命名空间已冻结：改写属性抛 TypeError（杜绝下游挂载/篡改）', () => {
    expect(Object.isFrozen(datefmt)).toBe(true);
    expect(() => {
      (datefmt as unknown as { format: unknown }).format = () => 'x';
    }).toThrow(TypeError);
    expect(() => {
      (datefmt as unknown as Record<string, unknown>).hack = 1;
    }).toThrow(TypeError);
  });
});

describe('DateFmt 建造者（Builder 模式，不可变）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(BASE);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('默认模板与 format() 输出一致', () => {
    expect(DateFmt.create().render()).toBe(format());
    expect(datefmt.create().render()).toBe('2023-03-10 15:00:00');
  });

  it('pattern / offset 链式调用等价于 format(offset, pattern)', () => {
    expect(DateFmt.create('YYYY-MM-DD').offset(-7).render()).toBe(format('-7', 'YYYY-MM-DD'));
    expect(datefmt.create().pattern('MM-DD').offset('+3').render()).toBe('03-13');
  });

  it('偏移字符串（含首尾空格）与数字形式等价', () => {
    expect(DateFmt.create('YYYY-MM-DD').offset(' -7 ').render()).toBe('2023-03-03');
    expect(DateFmt.create('YYYY-MM-DD').offset(-7).render()).toBe('2023-03-03');
  });

  it('多次 offset 叠加：offset(-7).offset("+3") = 净偏移 -4', () => {
    expect(DateFmt.create('YYYY-MM-DD').offset(-7).offset('+3').render()).toBe('2023-03-06');
  });

  it('偏移保留基准时刻的时分秒（与旧工具语义一致）', () => {
    expect(DateFmt.create('YYYY-MM-DD hh:ii:ss').offset('-7').render()).toBe(
      '2023-03-03 15:00:00',
    );
  });

  it('非法 offset 参数忽略不抛错、返回原实例', () => {
    const b = DateFmt.create('YYYY-MM-DD');
    expect(b.offset('abc')).toBe(b);
    expect(b.offset(NaN)).toBe(b);
    expect(b.offset('abc').render()).toBe('2023-03-10');
  });

  it('不可变：派生链互不影响、原实例不被修改（无状态污染）', () => {
    const today = DateFmt.create('YYYY-MM-DD');
    const lastWeek = today.offset(-7);
    const nextWeek = today.offset(7);

    expect(today.render()).toBe('2023-03-10');
    expect(lastWeek.render()).toBe('2023-03-03');
    expect(nextWeek.render()).toBe('2023-03-17');

    // 改派生实例的模板不影响兄弟实例与原实例
    const styled = lastWeek.pattern('MM/DD');
    expect(styled.render()).toBe('03/03');
    expect(lastWeek.render()).toBe('2023-03-03');
    expect(today.render()).toBe('2023-03-10');
  });

  it('base() 注入基准时间（不依赖系统时钟）', () => {
    const fixed = new Date(2020, 1, 29, 8, 30, 0); // 2020-02-29（闰年）
    expect(DateFmt.create('YYYY-MM-DD hh:ii:ss').base(fixed).render()).toBe(
      '2020-02-29 08:30:00',
    );
    expect(DateFmt.create('YYYY-MM-DD').base(fixed).offset(1).render()).toBe('2020-03-01');
  });

  it('toString() 等价 render()，可直接用于模板字符串', () => {
    const b = DateFmt.create('YYYY-MM-DD').offset(-7);
    expect(`${b}`).toBe('2023-03-03');
    expect(b.toString()).toBe(b.render());
  });

  it('中文 token 在建造者中同样可用', () => {
    expect(DateFmt.create('Y年M月D日 YYYY/MM/DD a').offset(-7).render()).toBe(
      '二零二三年三月三日 2023/03/03 下午',
    );
    expect(DateFmt.create('今天EE').render()).toBe('今天周五');
  });
});
