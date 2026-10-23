/**
 * @iefe/dateformat —— 框架无关的轻量日期工具（零框架依赖，Vue / React / 原生 JS 均可使用）。
 *
 * 完全兼容旧版 `format` 调用约定（老代码无需改动即可迁移），
 * 另提供 `getYearLastDays` / `getYearofDays` / `getDays` 三个辅助方法。
 * 纯函数实现、非法入参回退默认值而非抛异常、`sideEffects: false` 可 tree-shaking。
 *
 * @packageDocumentation
 */

export { format } from './core/format';
export { getYearLastDays, getYearofDays, getDays } from './helpers/dateInfo';
