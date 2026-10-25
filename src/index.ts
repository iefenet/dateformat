/**
 * @iefe/dateformat —— 框架无关的轻量日期工具（零框架依赖，Vue / React / 原生 JS 均可使用）。
 *
 * 完全兼容旧版 `format` 调用约定（老代码无需改动即可迁移），
 * 另提供 `getYearLastDays` / `getYearofDays` / `getDays` 三个辅助方法。
 * 纯函数实现、非法入参回退默认值而非抛异常、`sideEffects: false` 可 tree-shaking。
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
export { getYearLastDays, getYearofDays, getDays } from './helpers/dateInfo';
export { DateFmt } from './core/DateFmt';
export { datefmt } from './facade';
