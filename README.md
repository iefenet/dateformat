# @iefe/dateformat

> 框架无关的轻量日期工具：**完全兼容旧版 `format` 调用约定**（老代码无需改动即可迁移），并按功能提供五组 API——格式化（含中文大写日期）、解析与校验（iOS 兼容）、相对时间与差值、日期比较、年月信息。另提供 `datefmt` 冻结命名空间与不可变建造者，避免 `format` 等高频命名与业务代码冲突（变量污染）。零框架依赖、可 tree-shaking、自带 TypeScript 类型。

## 安装

```bash
npm install @iefe/dateformat
# 或
yarn add @iefe/dateformat
# 或
pnpm add @iefe/dateformat
```

## 功能总览

| 分类 | API | 一句话说明 |
| --- | --- | --- |
| **格式化** | `format` | 旧版调用约定（偏移字符串 + 模板），完全兼容 |
| | `formatDate` | 格式化**任意日期**（字符串或 `Date`，不限"今天 ± N 天"） |
| **解析与校验** | `parseDate` | 日期字符串 → `Date`（iOS Safari 兼容 + 回写校验） |
| | `isValid` | 输入是否为可解析的合法日期 |
| **相对时间与差值** | `fromNow` | `'3 分钟前'` / `'2 天后'` 中文相对时间 |
| | `diff` | 两日期差值 `a - b`，支持 7 种单位 |
| **日期比较** | `isToday` / `isSameDay` | 日粒度判断（忽略时分秒） |
| | `isBefore` / `isAfter` | 时刻粒度比较（精确到毫秒） |
| **年月信息** | `getDays` | 指定年月的天数（28/29/30/31） |
| | `getYearofDays` | 指定年份总天数（365/366） |
| | `getYearLastDays` | 今年剩余天数（不含今天） |
| | `isLeapYear` | 是否闰年 |
| **调用方式** | `datefmt` | 冻结命名空间（只导入一个标识符） |
| | `DateFmt` / `datefmt.create` | 不可变链式建造者（Builder 模式） |

所有 API 均可通过具名导出或 `datefmt` 命名空间调用，行为完全一致。

---

## 一、格式化

### 1.1 `format` —— 旧版调用约定（完全兼容）

调用形式：

- `format()` —— 当前时间，默认模板 `'YYYY-MM-DD hh:ii:ss'`
- `format(pattern)` —— 当前时间按模板格式化
- `format(offset, pattern)` —— 相对今天偏移 N 天后按模板格式化

偏移字符串（如 `'-7'`、`'0'`、`'+3'`、`'  -7 '`）表示相对今天偏移 N 天，仅平移日期、**保留当天时分秒**。以下示例假设当前时间为 **2023-03-10 15:00:00（星期五）**，输出与旧工具逐字一致：

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
| `format()` | `'2023-03-10 15:00:00'` |

### 1.2 `formatDate` —— 格式化任意日期

`format` 的基准恒为"今天"，想格式化一个用户给定的日期（如后端返回值、生日）用 `formatDate`：

```ts
import { formatDate } from '@iefe/dateformat';

formatDate('2024-02-29')                          // '2024-02-29 00:00:00'（默认模板）
formatDate('2024/02/15 10:30:00', 'MM-DD hh:ii') // '02-15 10:30'
formatDate(new Date(), 'Y年M月D日')                // 中文大写同样可用
formatDate('2023-03-10', '[第]Q季度 DDD')          // '第1季度 069'（扩展 token 同样可用）
```

- 第一个参数支持 `'YYYY-MM-DD'`、`'YYYY/MM/DD hh:ii:ss'` 等字符串或 `Date` 对象（解析规则见 [2.1 `parseDate`](#21-parsedate--ios-兼容解析)）；
- 模板省略时默认 `'YYYY-MM-DD hh:ii:ss'`；
- **非法入参回退当前时间**而非抛错（`formatDate('abc')` → 当前时间，与 `getDays` 回退本月同约定）；
- 偏移能力留给 `format` / 建造者——`formatDate('-7', 'YYYY-MM-DD')` 中 `'-7'` 不是合法日期，同样回退当前时间。

### 1.3 Token 对照表

**基础 token**

| Token | 含义 | 示例 | 说明 |
| --- | --- | --- | --- |
| `YYYY` | 四位年 | `2023` | |
| `YY` | 两位年 | `23` | |
| `MM` | 两位月（补零） | `03` | |
| `DD` | 两位日（补零） | `10` | |
| `hh` | 两位时（24h 补零） | `15` | 注意：这里是 **24 小时制**，与常见库相反 |
| `H` | 时（不补零，24h） | `15` | 兼容用 |
| `ii` | 两位分（补零） | `00` | 注意是 `ii` 不是 `mm` |
| `i` | 分（不补零） | `0` | |
| `ss` | 两位秒（补零） | `00` | |
| `s` | 秒（不补零） | `0` | |
| `a` | 时段 | `上午` / `下午` / `凌晨` / `晚上` 等 | 见下方规则 |
| `EEE` | 星期全称 | `星期五` | |
| `EE` | 星期简称 | `周五` | |

**中文大写 token**

| Token | 含义 | 示例 |
| --- | --- | --- |
| `Y` | 中文大写年（逐位） | `二零二三` |
| `M` | 中文大写月 | `三`（1~12 → 一~十二） |
| `D` | 中文大写日 | `十`、`二十一`（1~31） |

**扩展 token**

| Token | 含义 | 示例 | 说明 |
| --- | --- | --- | --- |
| `SSS` | 三位毫秒（补零） | `007` / `123` | |
| `Q` | 季度 | `1` ~ `4` | |
| `DDD` | 年内第几天（三位补零） | `069` | 3 月 10 日（平年）= 31 + 28 + 10 |
| `ww` | ISO 8601 年内周数（两位补零） | `10` | **周一**为一周开始，含当年首个周四的周为第 1 周；跨年边界周序号可能属于相邻年份（如 2023-01-01 → `52`） |
| `x` | Unix 时间戳（毫秒） | `1678431600000` | |
| `X` | Unix 时间戳（秒） | `1678431600` | |

> **注意**：本工具 **`hh` 表示 24 小时制**（不是 12 小时制），`ii` 表示分钟（不是 `mm`）。这是与既有工具保持一致的关键，不要按 dayjs 风格理解。另外，`M` / `D` / `Y` 输出的是**中文数字本身**（如 `三`、`十`、`二零二三`），"月 / 日 / 年"等字符来自模板——示例中的 `三月`、`十日` 分别是 `format('M月')`、`format('D日')` 的输出。

**中文数字规则**

- 年份大写（`Y`）逐位转换：`2 0 2 3` → `二零二三`（0零 1一 2二 3三 4四 5五 6六 7七 8八 9九）
- 月份大写（`M`）：1→一 … 10→十、11→十一、12→十二
- 日期大写（`D`）：1→一 … 10→十、11→十一 … 20→二十、21→二十一 … 30→三十、31→三十一
- 时段（`a`）按 24 小时制小时划分：0~5 凌晨；6~8 早上；9~11 上午；12 中午；13~17 下午；18~23 晚上
- 星期（`EEE`/`EE`）：`星期日/一/二/三/四/五/六` 与 `周日/一/二/三/四/五/六`

### 1.4 字面量转义 `[方括号]`

模板里的独立字母 `a`、`i`、`s`、`H`、`Q`、`x`、`X`、`Y`、`M`、`D` 都是 token，会被替换。模板中的固定文案请用 **`[方括号]` 转义**——方括号内的内容不作为 token，脱去括号原样输出：

```ts
format('[abc]')        // 'abc'（而非 '上午bc'）
format('off[s]et[-7]') // 'offset-7'（s 与 -7 都不再被当作 token）
format('[今天是]EE')    // '今天是周五'
format('[YYYY]年')     // 'YYYY年'（想输出字面量 YYYY 的话）
```

未闭合的方括号（如 `'[EE'`）不转义，维持原行为：括号原样保留、内部 token 照常替换。

---

## 二、解析与校验

### 2.1 `parseDate` —— iOS 兼容解析

把日期字符串解析为 `Date`。不依赖 `new Date(string)` 原生解析，而是取出年月日时分秒后按组件构造，**天然规避 iOS Safari 上 `new Date('2024-01-01 12:00:00')` 返回 Invalid Date 的问题**；并带回写校验，`'2023-02-31'` 这类溢出输入直接判非法：

```ts
import { parseDate } from '@iefe/dateformat';

parseDate('2024-02-15')           // 2024 年 2 月 15 日 0 点的 Date
parseDate('2024-01-01 12:00:00')  // iOS Safari 下同样可用（空格或 T 分隔均可）
parseDate('2024/2/5')             // 斜杠、不补零的月日均可
parseDate('2023-02-31')           // null（回写校验：2 月没有 31 日）
parseDate('abc')                  // null（非法输入返回 null，不抛错）
```

支持的字符串格式（日期与时间之间的分隔符 `-` / `/` 前后需一致）：

- `'YYYY-MM'`、`'YYYY/MM'`
- `'YYYY-MM-DD'`、`'YYYY/MM/DD'`
- 上述任意格式带时间部分：`'2024-01-01 12:00'`、`'2024-01-01T12:00:00'` 等

### 2.2 `isValid` —— 合法性判断

`parseDate` 的布尔便捷形式，适合表单校验等场景：

```ts
isValid('2024-02-29')  // true
isValid('2023-02-29')  // false（平年 2 月无 29 日）
isValid(new Date('x')) // false（Invalid Date）
isValid(undefined)     // false
```

---

## 三、相对时间与差值

### 3.1 `fromNow` —— 中文相对时间

```ts
import { fromNow } from '@iefe/dateformat';

// 假设当前时间 2023-03-10 15:00:00
fromNow(new Date())         // '刚刚'
fromNow('2023-03-10 14:30') // '30 分钟前'
fromNow('2023-03-11 14:00') // '23 小时后'
fromNow('2023-03-09 15:00') // '1 天前'
fromNow('2022-04-10 15:00') // '11 个月前'
fromNow('2013-03-10 15:00') // '10 年前'
fromNow('abc')              // ''（非法输入返回空字符串，不误报"刚刚"）
```

阈值规则（按已过去的时长就近取档，月/年为 `30` / `365` 天的近似换算，向零取整）：

| 距今 | 输出 |
| --- | --- |
| < 1 分钟 | `'刚刚'`（过去/未来同文案） |
| < 1 小时 | `'N 分钟前'` / `'N 分钟后'` |
| < 1 天 | `'N 小时前'` / `'N 小时后'` |
| < 30 天 | `'N 天前'` / `'N 天后'` |
| < 12 个月 | `'N 个月前'` / `'N 个月后'` |
| 更久 | `'N 年前'` / `'N 年后'` |

### 3.2 `diff` —— 两日期差值

计算 `a - b`，负数表示 `a` 早于 `b`：

```ts
import { diff } from '@iefe/dateformat';

diff('2024-03-01', '2024-01-01')                    // 60（默认单位 day）
diff('2024-01-01', '2024-03-01')                    // -60
diff('2024-03-01 12:00', '2024-03-01 10:30', 'hour') // 1（1.5 小时向零取整）
diff('2024-03-01', '2024-01-01', 'month')           // 2
diff('2024-02-29', '2024-01-31', 'month')           // 1（月末钳制：1-31 → 2-29 算满月）
diff('2024-03-10', '2000-03-15', 'year')            // 23（只统计满整周年）
```

单位语义（TS 类型 `DiffUnit`）：

- `'ms'` / `'second'` / `'minute'` / `'hour'` / `'day'`：**精确时间差**换算后向零取整——跨零点但不足 24 小时按 `'day'` 得 `0`（与 dayjs 一致，不按"过了几个零点"计数）；
- `'month'` / `'year'`：**日历差值**，只统计满整月 / 整周年的部分，月末按钳制规则（`2024-01-31` + 1 月 = `2024-02-29`）。

`a` / `b` 缺失或非法时回退当前时间（不抛错），如 `diff('abc')` → `0`。

---

## 四、日期比较

```ts
import { isToday, isSameDay, isBefore, isAfter } from '@iefe/dateformat';

// 假设今天是 2023-03-10
isToday('2023-03-10 23:59')                  // true（日粒度，忽略时分秒）
isToday('2023-03-11')                        // false

isSameDay('2023-03-10 08:00', '2023-03-10 23:59') // true
isSameDay('2023-03-10', '2023-03-11')              // false

isBefore('2023-03-10 08:00', '2023-03-10 09:00')  // true（时刻粒度，精确到毫秒）
isAfter('2023-03-11', '2023-03-10')               // true
isBefore('2023-03-10', '2023-03-10')              // false（相等既不早于也不晚于）
```

- `isToday` / `isSameDay` 按**日粒度**（年月日相同即真）；`isBefore` / `isAfter` 按**时刻粒度**（精确到毫秒，相等返回 `false`）；
- **判定类函数对非法或缺失输入一律返回 `false`**，不做"回退当前时间"（回退会让 `isSameDay('abc', today)` 在今天恰好命中时误报 `true`）；值类函数（`format` / `getDays` 等）仍保持库级回退约定。

---

## 五、年月信息

| 名称 | 参数 | 类型 | 默认值 | 说明 | 返回 |
| --- | --- | --- | --- | --- | --- |
| `getYearLastDays` | 无 | — | — | **今年剩余天数**（不含今天） | number |
| `getYearofDays` | year / 选填 | number \| string | 今年 | **指定年份的总天数**（365/366） | number |
| `getDays` | date / 选填 | dateString | 本月 | **指定日期所在月份的天数** | number |
| `isLeapYear` | year / 选填 | number \| string | 今年 | 是否**闰年**（2000 闰、1900 平） | boolean |

示例（假设今天是 2023-03-10，平年）：

```ts
import { getDays, getYearLastDays, getYearofDays, isLeapYear } from '@iefe/dateformat';

getYearLastDays()               // 296（今年剩余，不含今天）
getYearofDays()                 // 365
getYearofDays() - getYearLastDays() // 69（今年已过去）
getYearofDays('2022')           // 365
getYearofDays(2024)             // 366
getDays()                       // 31（本月）
getDays('2023-02')              // 28
getDays('2024-02')              // 29
isLeapYear(2024)                // true
isLeapYear(1900)                // false
```

- `getDays` 支持 `'YYYY-MM'`、`'YYYY-MM-DD'`、`'YYYY/MM'`、`'YYYY/MM/DD'` 与 `Date` 对象，只取年月；
- 四个方法**无参时一律以"今天"为基准**；非法入参回退默认值而非抛错（如 `getYearofDays('abc')` → 今年总天数，`getDays('abc')` → 本月天数）。

---

## 六、命名空间与建造者（避免变量污染）

`format`、`getDays` 是前端最高频的命名之一，按名导入（`import { format } from '@iefe/dateformat'`）会把这些名字带进你的模块作用域，容易与业务代码自身或 date-fns 等库的同名导出互相覆盖。为此提供两种**零污染**用法（新代码推荐）：

**1. 命名空间门面（Facade）—— 只导入一个标识符**

```ts
import { datefmt } from '@iefe/dateformat';

datefmt.format('-7', 'YYYY-MM-DD'); // '2023-03-03'
datefmt.formatDate('2024-02-29');   // '2024-02-29 00:00:00'
datefmt.fromNow('2023-03-10 14:30'); // '30 分钟前'
datefmt.getDays('2024-02');         // 29
```

上文五组功能的所有函数都收拢在 `datefmt` 上，与具名导出同源同行为。对象经 `Object.freeze` 冻结，运行时改写/挂载任何属性都会抛 `TypeError`，下游无法篡改。

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

---

## 快速开始

### 原生 JS（ESM）

```html
<script type="module">
  import { format, formatDate, fromNow, getDays } from 'https://unpkg.com/@iefe/dateformat/dist/index.js';

  console.log(format());                   // 当前时间 'YYYY-MM-DD hh:ii:ss'
  console.log(format('-7', 'YYYY-MM-DD')); // 7 天前
  console.log(formatDate('2024-02-29'));   // '2024-02-29 00:00:00'
  console.log(fromNow('2023-03-10'));      // 相对时间描述
  console.log(getDays('2023-02'));         // 28
</script>
```

Node.js（CJS）：

```js
const {
  format, formatDate, fromNow, diff, isValid,
  isToday, getYearLastDays, getYearofDays, getDays, isLeapYear,
} = require('@iefe/dateformat');

console.log(format('YYYY年MM月DD日 a'));
console.log(formatDate('2024-02-29', 'Y年M月D日'));
console.log(fromNow('2024-01-01'));
console.log(diff('2024-03-01', '2024-01-01', 'day'));
console.log(isValid('2023-02-29'));        // false
console.log(isToday(new Date()));          // true
console.log('今年剩余：' + getYearLastDays() + '天');
console.log('今年已过去：' + (getYearofDays() - getYearLastDays()) + '天');
console.log('2024 是闰年：' + isLeapYear(2024));
console.log('本月一共：' + getDays() + '天');
```

### Vue 3

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { formatDate, fromNow, getDays, isToday } from '@iefe/dateformat';

const today = ref(formatDate(new Date(), 'YYYY年MM月DD日 a'));
const week = ref(formatDate(new Date(), '今天EE'));
const monthDays = getDays();
const createdAt = '2024-01-01 09:30';
</script>

<template>
  <p>{{ today }}（{{ week }}），本月共 {{ monthDays }} 天</p>
  <p v-if="isToday(createdAt)">今天创建</p>
  <p v-else>创建于 {{ fromNow(createdAt) }}</p>
</template>
```

### React 18

```tsx
import { useMemo } from 'react';
import { formatDate, fromNow, getDays, getYearLastDays, isToday } from '@iefe/dateformat';

export function Today({ createdAt }: { createdAt: string }) {
  const text = useMemo(() => formatDate(new Date(), 'YYYY年MM月DD日 a'), []);
  return (
    <p>
      {text}，本月共 {getDays()} 天，今年还剩 {getYearLastDays()} 天；
      该记录创建于 {isToday(createdAt) ? '今天' : fromNow(createdAt)}
    </p>
  );
}
```

### 可选封装示例：`useFormattedDate`

React（`useFormattedDate.ts`）：

```tsx
import { useMemo } from 'react';
import { formatDate } from '@iefe/dateformat';

/** 基准日期或模板变化时才重新计算 */
export function useFormattedDate(date?: string | Date, pattern?: string): string {
  return useMemo(() => formatDate(date, pattern), [date, pattern]);
}

// 使用：<span>{useFormattedDate(new Date(), 'Y年M月D日')}</span>
```

Vue 3（`useFormattedDate.ts`）：

```ts
import { computed, type Ref } from 'vue';
import { formatDate } from '@iefe/dateformat';

export function useFormattedDate(date: Ref<string | Date | undefined>, pattern?: string) {
  return computed(() => formatDate(date.value, pattern));
}
```

## 已知限制

- **`hh` 是 24 小时制、`ii` 是分钟**——与 dayjs/moment 的 `HH` / `mm` 语义不同，从其它库迁移时请注意。
- 模板中的独立字母 `a`、`i`、`s`、`H`、`Q`、`x`、`X`、`Y`、`M`、`D` 都是 token，会被替换（如模板 `'abc'` 中的 `a` 会变成时段）。固定文案请用 `[方括号]` 转义（见 [1.4](#14-字面量转义-方括号)）。
- `ww` 为 ISO 8601 周数：**周一**为一周开始、含当年首个周四的周为第 1 周。年末/年初的周序号可能属于相邻年份（2023-01-01 → `52`、2024-12-30 → `01`），与同一模板中 `YYYY` 的年份可能相差 1。
- 仅使用运行环境**本地时区**，不做时区转换；`x` / `X` 时间戳不受时区影响。
- `getDays` 只取年月、忽略日部分（`'2024-02-31'` 也会返回 `29`）；`'2023-13'` 这类月份越界的输入回退本月。与之不同，`parseDate` / `isValid` / `diff` / `fromNow` / 比较函数对 `'2023-02-31'` 这类溢出日期**判非法**（回写校验）。
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
