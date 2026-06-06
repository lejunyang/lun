# `@lun-web/theme` — AGENTS.zh-CN.md

> `@lun-web/components` 的默认主题。SCSS 源码 + 一个 JS 产物，通过 components 的样式注册 hooks 装入。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 目录

```
src/
  index.ts                — 重导出 common + components 子 barrel
  scss/
    common/
      index.ts            — 注册 common 静态 + 动态主题（space、scale）
      index.scss          — common 规则，通过 `import ... ?inline` 消费
      color.ts            — 颜色主题注册
      keyframes.scss      — 全局 @keyframes（过渡库）
      radius.scss, shadow.scss, theme-colors.scss, transitions.scss, typography.scss
    components/
      <comp>/             — 每个组件一个目录，镜像 components/src/components/<comp>
        index.ts          — 每个文件执行 `createImportStyle(comp, <comp>.scss, [variant])`
        <comp>.scss       — 基础样式，使用主题 mixins / 变量
        <variant>.scss    — 可选变体样式（用 createImportStyle 的第三参注册）
    mixins/
      bem.scss            — BEM 帮手（与 GlobalStaticConfig BEM 分隔符对齐）
      config.scss         — namespace / 分隔符 / 状态前缀
      function.scss       — 工具 SCSS 函数
      theme.scss          — 主题变量读取
    utils/                — SCSS 端的 TS 帮手（getVarName、getVarValue、getHostStyle）
  custom/                 — `@lun-web/theme/custom` 的入口（给用户做主题覆写的 API）
```

包的 `exports`：

- `'.'` —— 跑所有 `createImportStyle` 注册的 JS 产物。import 它的副作用就是"装上"主题。
- `'./custom'` —— 面向用户的主题定制 API。
- `'./scss/common/*.scss'`、`'./scss/components/*'`、`'./scss/mixins/*.scss'` —— 给自建主题的项目提供原始 SCSS。

## 主题注册原理

1. 每个组件的 SCSS 在 JS 里用 Vite `?inline` 查询参数 import 成字符串。
2. 模块顶层调用 `createImportStyle(componentKey, scssString, variantName?)`（来自 `@lun-web/components`）。内部 `once` 保护，多次 import 不重复。
3. 字符串被推到 `GlobalStaticConfig.styles[componentKey]`，自定义元素在 `connectedCallback` 时读它，转成 `adoptedStyleSheets`（或对需要每实例变量的组件转成 `<style>` 节点）。
4. `createImportDynamicStyle(componentKey, (vm, comp, context) => string)` 用于依赖 context 主题的样式 —— 主题变化时会重算。

例（button）：

```ts
// scss/components/button/index.ts
import buttonScss from './button.scss?inline';
import softScss from './soft.scss?inline';
import { createImportStyle } from '@lun-web/components';

export const importButtonStyle = createImportStyle('button', buttonScss);
export const importButtonSoftStyle = createImportStyle('button', softScss, 'soft');
```

## 约定

| 规则 | 原因 |
|---|---|
| 所有视觉值用 CSS 变量（`--l-button-bg`、`--l-radius-2` …） | 运行时换肤、不用重打包 |
| 选择器用 `@include bem.b('button') { ... }` / `bem.e(...)` / `bem.m(...)` 构造 | BEM 分隔符与 `GlobalStaticConfig` 同步 |
| 读主题 token 用 `theme()` / `getVarValue()` 帮手 | 直接写死 `--l-...` 字符串会在用户改 namespace 时崩 |
| 一个文件一个职责（`size.scss`、`variant-soft.scss` …）；通过该目录的 `index.ts` 引入 | tree-shaking + 变体可选 |
| 变体样式用 `createImportStyle` 第三参注册 | 这样 `GlobalStaticConfig.availableVariants[comp]` 才知道有哪些变体 |
| 组件 SCSS 用 `:host` 写 shadow 内部样式，必要时才 `::slotted(...)` | 每个组件都在自己的 shadow root 中 |

## 新增组件主题

1. 建 `scss/components/<comp>/index.ts` 和 `scss/components/<comp>/<comp>.scss`。
2. `<comp>.scss` 里：
   - `@use '../../mixins' as *;`
   - `@include bem.b('<comp>') { ... }` 等等。
   - 值从 CSS 变量取；主题 token 走 helper。
3. `index.ts` 里：`export const importXStyle = createImportStyle('<comp>', xScss);`。
4. 把文件路径加到 `scss/components/index.ts`，让它跟着 JS 产物发布。
5. 变体作为独立 SCSS 文件，用第三参注册。

## Don't

- **不要** 写死颜色、圆角、字号、间距，用 CSS 变量。
- **不要** 写深选择器去够另一个组件的 shadow 内部（`l-input l-icon` 不会生效；各自在自己的 shadow 里）。
- **不要** 在组件 SCSS 里写 `@layer` 声明 —— `GlobalStaticConfig.wrapCSSLayer` 已经全局处理。
- **不要** import SCSS 不带 `?inline`（会得到 CSS 模块处理结果，不是字符串）。
- **不要** 依赖未声明的 peer。`bezier-easing` 和 `colorjs.io` 是 `optionalDependencies` —— 只有 `custom/` 下的 JS 在特性检测后才会用。
