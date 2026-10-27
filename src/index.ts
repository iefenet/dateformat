/**
 * @iefe/dateformat —— 框架无关的轻量日期工具（零框架依赖，Vue / React / 原生 JS 均可使用）。
 *
 * 按功能分为五组，全部纯函数、非法入参不抛错、`sideEffects: false` 可 tree-shaking：
 *
 * - **格式化**：`format`（完全兼容旧版调用约定，老代码无需改动）、`formatDate`（格式化任意日期）
 * - **解析与校验**：`parseDate`（iOS 兼容的字符串解析）、`isValid`
 * - **相对时间与差值**：`fromNow`（'3 分钟前'）、`diff`（两日期差值）
 * - **日期比较**：`isToday` / `isSameDay` / `isBefore` / `isAfter`
 * - **年月信息**：`getDays` / `getYearofDays` / `getYearLastDays` / `isLeapYear`
 *
 * 避免变量污染的两种入口（推荐新代码使用）：
 * - **Facade**：`import { datefmt } from '@iefe/dateformat'` —— 只引入一个冻结命名空间，
 *   不会把 `format` 这类高频名字带进调用方作用域；
 * - **Builder**：`datefmt.create('YYYY-MM-DD').offset(-7).render()` —— 不可变链式建造者，
 *   每步返回新实例，无任何共享可变状态。
 *
 * @packageDocumentation
 */

export { format } from './core/format';
export { formatDate } from './helpers/formatDate';
export { getYearLastDays, getYearofDays, getDays, isLeapYear } from './helpers/dateInfo';
export { parseDate, isValid } from './helpers/parse';
export { fromNow, diff } from './helpers/relative';
export { isToday, isSameDay, isBefore, isAfter } from './helpers/compare';
export { DateFmt } from './core/DateFmt';
export { datefmt } from './facade';
export type { DateInput, YearInput, DiffUnit } from './types';
