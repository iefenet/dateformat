import { DateFmt } from './core/DateFmt';
import { format } from './core/format';
import { getDays, getYearLastDays, getYearofDays } from './helpers/dateInfo';

/**
 * 命名空间门面（**Facade 模式**）：把全部能力收拢到**唯一一个**导入标识符上。
 *
 * 设计动机（避免变量污染）：
 * `format`、`getDays` 是前端最高频的命名之一，按名导入
 * （`import { format } from '@iefe/dateformat'`）会让这些名字进入调用方
 * 模块作用域，与业务代码自身或 date-fns 等其它库的同名导出互相覆盖。
 * 改用命名空间后，调用方作用域只多出一个 `datefmt`：
 *
 * ```ts
 * import { datefmt } from '@iefe/dateformat';
 *
 * datefmt.format('-7', 'YYYY-MM-DD'); // '2023-03-03'
 * datefmt.getDays('2024-02');         // 29
 * ```
 *
 * 对象经 `Object.freeze` 冻结：运行时（ESM 恒为严格模式）改写任何属性都会
 * 抛 `TypeError`，杜绝被下游挂载/篡改造成的状态污染。
 *
 * 原有具名导出（`format` / `getDays`…）**完全保留**，老代码与 tree-shaking
 * 行为不变；仅当担心命名冲突时改用本命名空间即可。
 */
export const datefmt = Object.freeze({
  /** {@link ../core/format!format | format}：旧版调用约定的格式化函数 */
  format,

  /** {@link ../helpers/dateInfo!getYearLastDays | getYearLastDays}：今年剩余天数（不含今天） */
  getYearLastDays,

  /** {@link ../helpers/dateInfo!getYearofDays | getYearofDays}：指定年份总天数（365/366） */
  getYearofDays,

  /** {@link ../helpers/dateInfo!getDays | getDays}：指定年月的天数（28/29/30/31） */
  getDays,

  /**
   * 建造者工厂（**Factory Method 模式**）：创建不可变链式建造者。
   *
   * @example
   * ```ts
   * // 假设当前时间 2023-03-10 15:00:00
   * datefmt.create('YYYY-MM-DD').offset(-7).render() // '2023-03-03'
   * ```
   */
  create: (pattern?: string): DateFmt => DateFmt.create(pattern),
});
