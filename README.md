# @iefe/dateformat

> 框架无关的轻量日期工具：**完全兼容旧版 `format` 调用约定**（老代码无需改动即可迁移），支持中文大写日期、相对天数偏移与年月天数查询。另提供 `datefmt` 冻结命名空间与不可变建造者，避免 `format` 等高频命名与业务代码冲突（变量污染）。零框架依赖、可 tree-shaking、自带 TypeScript 类型。

## 安装

```bash
npm install @iefe/dateformat
# 或
yarn add @iefe/dateformat
# 或
pnpm add @iefe/dateformat
```

## 兼容性对照表（老代码无需改动）

以下 `format` 示例假设当前时间为 **2023-03-10 15:00:00（星期五）**，输出与旧工具逐字一致：

| 调用 | 输出 |
| --- | --- |
| `format('YYYY-MM-DD hh:ii:ss')` | `'2023-03-10 15:00:00'` |
| `format('-7', 'YYYY-MM-DD')` | `'2023-03-03'` |
| `format('YYYY-MM-01')` | `'2023-03-01'` |
| `format('YYYY年MM月DD日')` | `'2023年03月10日'` |
| `format('Y年')` | `'二零二三年'` |
| `format('M月')` | `'三月'` |
| `format('D日')` | `'十日'` |
| `format('a')` | `'下午'` |
| `format('今天EEE')` | `'今天星期五'` |
| `format('今天EE')` | `'今天周五'` |
| `format(' -7 ', 'Y年M月D日 YYYY/MM/DD a')` | `'二零二三年三月三日 2023/03/03 下午'` |
| `format('hh:ii:ss')` | `'15:00:00'` |
| `format('hh:ii:ss a')` | `'15:00:00 下午'` |
| `format()` | `'2023-03-10 15:00:00'` |

辅助方法示例（假设今天是 2023-03-10，平年）：

| 调用 | 输出 |
| --- | --- |
| `getYearLastDays()` | `296`（今年剩余，不含今天） |
| `getYearofDays()` | `365` |
| `getYearofDays() - getYearLastDays()` | `69`（今年已过去） |
| `getYearofDays('2022')` | `365` |
| `getYearofDays(2024)` | `366` |
| `getDays()` | `31`（本月） |
| `getDays('2023-02')` | `28` |
| `getDays('2024-02')` | `29` |

## Token 对照表

| Token | 含义 | 示例 | 说明 |
| --- | --- | --- | --- |
| `YYYY` | 四位年 | `2023` | |
| `YY` | 两位年 | `23` | |
| `Y` | **中文大写年（逐位）** | `二零二三` | 每位数字转中文大写 |
| `MM` | 两位月（补零） | `03` | |
| `M` | **中文大写月** | `三月` | 1~12 转"一月"…"十二月" |
| `DD` | 两位日（补零） | `10` | |
| `D` | **中文大写日** | `十日` | 见下方规则 |
| `hh` | 两位时（24h 补零） | `15` | 注意：这里是 **24 小时制**，与常见库相反 |
| `H` | 时（不补零，24h） | `15` | 兼容用 |
| `ii` | 两位分（补零） | `00` | 注意是 `ii` 不是 `mm` |
| `i` | 分（不补零） | `0` | |
| `ss` | 两位秒（补零） | `00` | |
| `s` | 秒（不补零） | `0` | |
| `a` | 时段 | `上午` / `下午` / `凌晨` / `晚上` 等 | 见下方规则 |
| `EEE` | 星期全称 | `星期五` | |
| `EE` | 星期简称 | `周五` | |

> **注意**：本工具 **`hh` 表示 24 小时制**（不是 12 小时制），`ii` 表示分钟（不是 `mm`）。这是与既有工具保持一致的关键，不要按 dayjs 风格理解。另外，`M` / `D` / `Y` 输出的是**中文数字本身**（如 `三`、`十`、`二零二三`），"月 / 日 / 年"等字符来自模板——示例中的 `三月`、`十日` 分别是 `format('M月')`、`format('D日')` 的输出。

**中文数字规则**

- 年份大写（`Y`）逐位转换：`2 0 2 3` → `二零二三`（0零 1一 2二 3三 4四 5五 6六 7七 8八 9九）
- 月份大写（`M`）：1→一月 … 10→十月、11→十一月、12→十二月
- 日期大写（`D`）：1→一日 … 10→十日、11→十一日 … 20→二十日、21→二十一日 … 30→三十日、31→三十一日
- 时段（`a`）按 24 小时制小时划分：0~5 凌晨；6~8 早上；9~11 上午；12 中午；13~17 下午；18~23 晚上
- 星期（`EEE`/`EE`）：`星期日/一/二/三/四/五/六` 与 `周日/一/二/三/四/五/六`

## 辅助方法

| 名称 | 参数 | 类型 | 默认值 | 说明 | 返回 |
| --- | --- | --- | --- | --- | --- |
| `getYearLastDays` | 无 | — | — | 获取**今年剩余天数**（不含今天） | number |
| `getYearofDays` | year / 选填 | number \| string | 今年 | 获取**指定年份的总天数**（365/366） | number |
| `getDays` | date / 选填 | dateString | 本月 | 获取**指定日期所在月份的天数** | number |

- `getDays` 支持 `'YYYY-MM'`、`'YYYY-MM-DD'`、`'YYYY/MM'`、`'YYYY/MM/DD'` 与 `Date` 对象，只取年月
- 三个方法**无参时一律以"今天"为基准**；非法入参回退默认值而非抛错（如 `getYearofDays('abc')` → 今年总天数，`getDays('abc')` → 本月天数）

## 命名空间与建造者模式（避免变量污染）

`format`、`getDays` 是前端最高频的命名之一，按名导入（`import { format } from '@iefe/dateformat'`）会把这些名字带进你的模块作用域，容易与业务代码自身或 date-fns 等库的同名导出互相覆盖。为此提供两种**零污染**用法（新代码推荐）：

**1. 命名空间门面（Facade）—— 只导入一个标识符**

```ts
import { datefmt } from '@iefe/dateformat';

datefmt.format('-7', 'YYYY-MM-DD'); // '2023-03-03'
datefmt.getDays('2024-02');         // 29
```

`datefmt` 经 `Object.freeze` 冻结，运行时改写/挂载任何属性都会抛 `TypeError`，下游无法篡改。

**2. 不可变建造者（Builder）—— 链式配置，无共享可变状态**

```ts
import { datefmt } from '@iefe/dateformat';

datefmt.create('YYYY-MM-DD hh:ii:ss') // 工厂方法：以模板创建建造者
  .offset(-7)                         // 偏移 -7 天（可叠加）
  .render();                          // 产出字符串，假设今天 2023-03-10 → '2023-03-03 15:00:00'

// 每一步都返回新实例，原实例与兄弟实例互不影响（无状态串扰）：
const today = datefmt.create('YYYY-MM-DD');
const lastWeek = today.offset(-7); // 新实例 → '2023-03-03'
const nextWeek = today.offset(7);  // 新实例 → '2023-03-17'
today.render();                    // '2023-03-10'（原实例未被修改）
```

- 链式方法 `pattern` / `offset` / `base` 均返回**新的**建造者实例；`offset` 支持叠加（`.offset(-7).offset('+3')` 等价净偏移 `-4`），数字与偏移字符串（如 `' -7 '`）均可；
- 非法参数（如 `.offset('abc')`）按库约定**忽略不抛错**；
- `render()` 为延迟求值（调用时才读系统时间），`toString()` 等价，可直接用于模板字符串 `` `${builder}` ``；
- `base(date)` 可注入基准时间，便于测试固定时间；
- 原有具名导出（`format` / `getDays`…）**完全保留**，老代码与 tree-shaking 行为不变——只是担心命名冲突时，改用 `datefmt` 一个入口即可。

## 快速开始

### 原生 JS（ESM）

```html
<script type="module">
  import { format, getDays } from 'https://unpkg.com/@iefe/dateformat/dist/index.js';

  console.log(format());                  // 当前时间 'YYYY-MM-DD hh:ii:ss'
  console.log(format('-7', 'YYYY-MM-DD')) // 7 天前
  console.log(getDays('2023-02'));        // 28
</script>
```

Node.js（CJS）：

```js
const { format, getYearLastDays, getYearofDays, getDays } = require('@iefe/dateformat');

console.log('今年剩余：' + getYearLastDays() + '天');
console.log('今年已过去：' + (getYearofDays() - getYearLastDays()) + '天');
console.log('2022年一共：' + getYearofDays('2022') + '天');
console.log('本月一共：' + getDays() + '天');
console.log('本月一共：' + getDays('2023-02') + '天');
```

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { format, getDays } from '@iefe/dateformat';

const today = ref(format('YYYY年MM月DD日 a'));
const week = ref(format('今天EE'));
const monthDays = getDays();
</script>

<template>
  <p>{{ today }}（{{ week }}），本月共 {{ monthDays }} 天</p>
  <p>上周同日：{{ format('-7', 'YYYY-MM-DD') }}</p>
</template>
```

### React 18

```tsx
import { useMemo } from 'react';
import { format, getDays, getYearLastDays } from '@iefe/dateformat';

export function Today() {
  const text = useMemo(() => format('YYYY年MM月DD日 a'), []);
  return (
    <p>
      {text}，本月共 {getDays()} 天，今年还剩 {getYearLastDays()} 天
    </p>
  );
}
```

## 可选封装示例：`useFormattedDate`

React（`useFormattedDate.ts`）：

```tsx
import { useMemo } from 'react';
import { format } from '@iefe/dateformat';

/** 偏移或模板变化时才重新计算 */
export function useFormattedDate(a?: string, b?: string): string {
  return useMemo(() => format(a, b), [a, b]);
}

// 使用：<span>{useFormattedDate('Y年M月D日')}</span>
```

Vue 3（`useFormattedDate.ts`）：

```ts
import { computed, type Ref } from 'vue';
import { format } from '@iefe/dateformat';

export function useFormattedDate(offset: Ref<string | undefined>, pattern?: string) {
  return computed(() => format(offset.value, pattern));
}
```

## 已知限制

- **`hh` 是 24 小时制、`ii` 是分钟**——与 dayjs/moment 的 `HH` / `mm` 语义不同，从其它库迁移时请注意。
- 模板里的独立字母 `a`、`i`、`s`、`H`、`Y`、`M`、`D` 都是 token，会被替换（如模板 `'abc'` 中的 `a` 会变成时段）。模板中的固定文案请避开这些单字母。
- 仅使用运行环境**本地时区**，不做时区转换。
- `getDays` 只取年月、忽略日部分（`'2024-02-31'` 也会返回 `29`）；`'2023-13'` 这类月份越界的输入回退本月。
- 日期字符串解析不走 `new Date(string)`，而是取出年月日时分秒后按组件构造 `Date`，天然规避 iOS Safari 上 `'2024-01-01 12:00:00'` 解析失败的问题。
- 偏移字符串（如 `'-7'`）仅平移日期、**保留当前时分秒**（与旧工具示例 `format(' -7 ', '…a')` → `下午` 的行为一致）。
- 自迁移到 tsup 后不再提供 UMD 产物；浏览器请通过 ESM（`<script type="module">` + CDN）或打包工具使用。

## 发布

本项目使用 GitHub Actions + OIDC 可信发布，无需存储 npm token。

**发布新版本：**

```bash
npm version patch  # 或 minor / major
git push && git push --tags
```

推送 `v*` 标签后，GitHub Actions 会自动构建、测试并发布到 npm，附带 provenance 证明。

**首次设置：** 需要在 npmjs.com 包设置中配置 Trusted Publisher，详见 [npm 文档](https://docs.npmjs.com/trusted-publishers)。

## License

[MIT](./LICENSE)
