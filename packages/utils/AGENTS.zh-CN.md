# `@lun-web/utils` — AGENTS.zh-CN.md

> 可 tree-shake、零依赖的 JS utils。**不依赖 Vue，非 browser 模块不依赖 DOM**。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 目录

```
src/
  algorithm.ts      — 二分、debounce、throttle、retry …
  array.ts          — ensureArray、at、last …
  color.ts          — 颜色解析 / 转换
  event.ts          — addEventListener 帮手（on/off）、事件归一化
  function.ts       — runIfFn、noop、identity、once、cacheFunctionByParams/Key、promiseTry …
  get.ts            — 嵌套路径 get/set/has、virtualGetMerge 工厂
  is.ts             — 类型谓词（isString / isObject / isArray / isCSSStyleSheet …）
  number.ts         — toNumberIfValid、toPxIfNum、BigIntDecimal
  promise.ts        — delay、withResolvers、promiseTry
  set.ts            — set 帮手
  string.ts         — capitalize、hyphenate、camelize …
  time.ts           — 非浏览器场景也能用的时间帮手（仅浏览器的放 browser/）
  type/             — 纯 TS 类型工具（`MaybeArray`、`Constructor`、`UnwrapPrimitive`、`TryGet` …）
  object/
    compare.ts, copy.ts, index.ts, merge.ts, process.ts, value.ts
                    — 对象帮手（pick、pickNonNil、fromObject、objectKeys、freeze、inherit …）
  browser/
    alias.ts, detect.ts, dom.ts, edit.ts, event.ts, is.ts, keyboard.ts, overflow.ts,
    screen.ts, scroll.ts, shadowDom.ts, style.ts, support.ts, tabbable.ts, text.ts, time.ts
                    — 仅浏览器；用 `inBrowser` 门控或惰性化
  _internal.ts, _internalMethods.ts  — 模块私有常量，不通过 index 导出
```

`packages/utils/index.ts` 把所有分类全部顶层重导出，使用者扁平 import：

```ts
import { isArray, ensureArray, freeze, runIfFn } from '@lun-web/utils';
```

## 强制规则

- **不准 import Vue / @lun-web/core / @lun-web/components**。这是地基。需要它们就说明放错地方了。
- **可 tree-shake。** 每个导出必须是顶层具名函数 / 常量。**不要** 模块体里执行副作用，**不要** 大 switch 类的"feature"对象。
- **仅浏览器的代码放 `src/browser/`**。其他目录的模块必须能在 Node 和 worker 里跑。要访问 `window` / `document` 时走 `inBrowser`、`getDocumentElement()`、或 `inBrowser && document...`。
- **零依赖。** `package.json` 没有 `dependencies` 也没有 `peerDependencies`，保持这样。新引入的外部依赖放到 `@lun-web/components`（或真正消费它的包），不放这里。
- **稳定的对外面。** 这是最底层积木，重命名一个导出会波及所有上游 + 所有用户。

## 命名 + 风格

| 类型 | 约定 | 例 |
|---|---|---|
| 谓词 | `isFoo`，返回 `boolean` | `isString`、`isElement`、`isHTMLSlotElement` |
| 强转 | `toFoo`、`toFooIfBar` | `toNumberIfValid`、`toPxIfNum`、`ensureArray` |
| 工厂 | `createFoo`，返回函数或对象 | `createElement`、`createVirtualMerge`、`cacheFunctionByKey` |
| 特性检测常量 | `support<Feature>`、`inBrowser` | `supportPopover`、`supportCSSAutoHeightTransition`、`supportCustomElement` |
| 内联可能是函数的值 | `runIfFn(maybeFn, ...args)` | **优先用** 而不是 `typeof x === 'function' ? x(...args) : x` |
| 函数式帮手 | 友好柯里化的参数顺序：`(thing, options)` | `freeze`、`inherit`、`pick(obj, keys)` |

## 加新 / 复用

写新 helper 前：

1. 在整个 `packages/utils/src/` 搜相似名字（分类故意有点重叠）。
2. 先查 `function.ts`、`object/`、`is.ts` —— 最通用的原语在这里。
3. 涉及 DOM 的查 `browser/`。
4. 组件相关的 helper（例如"按 size 算 BEM class"）**不属于** 这里 —— 推到 `@lun-web/components/src/utils/` 或 `hooks/`。

## Don't

- **不要** 用 default export，只用具名。
- **不要** 转手 lodash / 类似库。需要什么自己实现，保持表面小。
- **不要** import `'@lun-web/*'`（会循环）。
- **不要** 写一个"私有"函数然后让别的包通过深路径 import 它。如果文件外要用，给它命名并从 `index.ts` 导出。
- **不要** 写复述函数名的注释。注释留给非显式的边界情况（浏览器怪癖、Spec 陷阱）。

## 测试

- Vitest，`environment: 'node'`，纯单测。
- 仅浏览器的 utils 也能在 node 里通过 stub global 测，但通常更省事是留给 components 端测试套件。
