import { DEFAULT_PATTERN, render } from './format';
import { applyOffset, parseOffset } from './offset';
import { resolveNow } from './toDate';

/** 建造者配置快照：一次性冻结，链式调用只增不改（不可变，避免实例间状态串扰） */
interface DateFmtOptions {
  /** 格式化模板 */
  pattern: string;
  /** 累计偏移天数；`null` 表示未设置偏移 */
  offsetDays: number | null;
  /** 注入的基准时间（默认 `undefined` = 取当前时间），便于测试固定时间 */
  baseDate?: Date;
}

/**
 * 日期格式化建造者（**Builder 模式**，不可变实现）。
 *
 * 设计动机：具名函数导入（`import { format }`）会把 `format` 这类高频名字
 * 引入调用方作用域，极易与业务代码或其它库的同名函数冲突（变量污染）；
 * 同时"先配置、后产出"的链式写法也需要在不引入共享可变状态的前提下承载。
 *
 * 因此本类遵循两条不可变约束：
 * 1. 所有配置存于私有的 `options` 快照，`pattern` / `offset` / `base`
 *    每次都返回**携带新快照的新实例**，原实例及其派生链互不影响；
 * 2. 类与模块均无任何可写静态/全局变量，多实例并发使用天然隔离。
 *
 * 通过 {@link ../facade!datefmt.create} 工厂方法创建实例（推荐），
 * 或直接 `DateFmt.create()`。
 *
 * @example
 * ```ts
 * // 假设当前时间 2023-03-10 15:00:00（星期五）
 * DateFmt.create('YYYY-MM-DD hh:ii:ss').offset(-7).render()
 * // '2023-03-03 15:00:00'
 *
 * const today = DateFmt.create('YYYY-MM-DD');
 * const lastWeek = today.offset(-7);   // 新实例
 * const nextWeek = today.offset(7);    // 新实例，与 lastWeek 互不影响
 * today.render();                      // '2023-03-10'（原实例未被修改）
 * ```
 */
export class DateFmt {
  private readonly options: DateFmtOptions;

  /** 私有构造：外部一律走 {@link DateFmt.create} 工厂方法 */
  private constructor(options: DateFmtOptions) {
    this.options = options;
  }

  /**
   * 工厂方法：以模板创建建造者（**Factory Method 模式**入口）。
   *
   * @param pattern - 格式化模板，默认 `'YYYY-MM-DD hh:ii:ss'`（与旧工具一致）
   */
  static create(pattern: string = DEFAULT_PATTERN): DateFmt {
    return new DateFmt({ pattern, offsetDays: null });
  }

  /**
   * 设置格式化模板，返回**新实例**（原实例不变）。
   *
   * @example
   * ```ts
   * DateFmt.create().pattern('Y年M月D日').render() // '二零二三年三月十日'
   * ```
   */
  pattern(pattern: string): DateFmt {
    return new DateFmt({ ...this.options, pattern });
  }

  /**
   * 偏移天数，返回**新实例**（原实例不变）。多次调用**叠加**：
   * `.offset(-7).offset('+3')` 等价于净偏移 `-4`。
   *
   * 与旧工具语义一致：仅平移日期、保留基准时刻的时分秒。
   * 非法参数（如 `'abc'`、`NaN`）按库约定**忽略不抛错**（返回原实例）。
   *
   * @param days - 天数：`number`（如 `-7`）或偏移字符串（如 `'-7'`、`' +3 '`）
   *
   * @example
   * ```ts
   * // 假设当前时间 2023-03-10 15:00:00
   * DateFmt.create('YYYY-MM-DD').offset('-7').render() // '2023-03-03'
   * ```
   */
  offset(days: number | string): DateFmt {
    const n =
      typeof days === 'number'
        ? Number.isFinite(days)
          ? Math.trunc(days)
          : null
        : parseOffset(days);
    if (n === null) return this; // 非法输入忽略，不产生新实例
    return new DateFmt({ ...this.options, offsetDays: (this.options.offsetDays ?? 0) + n });
  }

  /**
   * 注入基准时间（默认当前时间），返回**新实例**（原实例不变）。
   *
   * @param date - 基准时间；非法值（如 `Invalid Date`）会被 {@link resolveNow} 回退为当前时间
   */
  base(date?: Date): DateFmt {
    return new DateFmt({ ...this.options, baseDate: date });
  }

  /**
   * 产出格式化结果（建造终态）。
   *
   * 延迟求值：`render()` 被调用时才读取系统时间，
   * 因此链式配置阶段的时间开销为零，也可先建链、后渲染。
   */
  render(): string {
    const now = resolveNow(this.options.baseDate);
    const date =
      this.options.offsetDays === null ? now : applyOffset(now, this.options.offsetDays);
    return render(this.options.pattern, date);
  }

  /** {@link render} 的别名，允许建造者直接用于模板字符串（`` `${builder}` ``）。 */
  toString(): string {
    return this.render();
  }
}
