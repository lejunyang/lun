# AGENTS.zh-CN.md — Lun (`@lun-web/*`)

> 面向 AI 编码助手（Claude / Copilot / Cursor …）的协作指南，与英文 [`AGENTS.md`](./AGENTS.md) 对应。
> 给人看的总览在 `README.zh-CN.md`。

## 1. 项目是什么

`Lun` 是一个 **跨框架的 Web Components 组件库**。作者层用 **Vue 3**，但每个发布的组件最终都是 **Shadow DOM 自定义元素**，使用者从任何框架（或纯 HTML）都通过 DOM 而不是 Vue API 来使用它们。库本身大量利用现代 Web API（Popover、CSS Anchor Positioning、CustomStateSet、View Transitions、容器查询、`calc-size` 等），并提供优雅降级。

下面这几条 **必须刻进脑子**：

- 组件是用 `packages/components/src/custom/apiCustomElement.ts` 里的 **私有 `defineCustomElement`** 定义的，**不是** Vue 上游那个。它经过了大量改写：自定义父子查找、emit 重写、样式注入、属性反射等。**不要** 从 `'vue'` 导入 `defineCustomElement`。
- 每个组件位于自己的 shadow root 中。父子之间的 provide/inject 通过自定义的 `_findParent`（slot → `parentNode` → `host` → `virtualParentMap`）跨越 shadow 边界。怀疑行为时先读 `apiCustomElement.ts`，不要预设 Vue 的默认语义。
- props 同时映射到 **attribute**（kebab-case，反射写回）和 **property**（camelCase）。事件以原生 `CustomEvent` 派发，事件名风格通过配置可选 `camel` / `kebab` / `pascal` / `lower` / `upper`。
- 中央配置 `GlobalStaticConfig` / `GlobalContextConfig`（`packages/components/src/components/config/`）控制命名空间、BEM 分隔符、默认 props、属性变换、事件名风格、主题默认值、预设（`math`、`date`）、各组件样式。"X 怎么改"很多时候答案就在它们里面。

## 2. 目录结构（monorepo，pnpm workspaces）

```
packages/
  components/   # 已发布的 @lun-web/components —— 所有自定义元素在这里
  core/         # 框架无关 + Vue 相关的 hooks / composables / presets（不含 DOM 组件）
  utils/        # 纯 JS utils（不依赖 Vue，不依赖 DOM）
  theme/        # 默认主题：SCSS 源码 + 注册样式的 JS
  plugins/      # Vue compiler-core 指令变换 (v-update, v-content) + Babel 等价物
  react/        # 给 React <19 用户（以及 React 19，独立产物）的 React 包装
src/            # VitePress 文档站点（同时充当 dev playground）
utils/          # 构建 / 测试 / 文档脚本（vite 插件、testSetup、文档生成）
public/
tsconfig.*.json # base / docs.react / node —— 路径相对 tsconfig 解析（不要用 baseUrl）
vitest.workspace.ts  # 各 package 独立测试环境（components/react 用 Playwright 真浏览器）
pnpm-workspace.yaml  # pnpm catalogs 锁定 vue / react / vite / typescript / postcss-logical 等
```

包依赖方向（**严禁反向**）：

```
utils  ←  core  ←  components  ←  react
                              ↖   theme   （只在类型/helper 层依赖 components）
plugins ← （通过 Vue 指令系统在运行时被 components 使用）
```

`utils` 禁止 import vue。`core` 可以 import vue，但禁止 import `components`。`theme` / `react` 依赖 `components`。

## 3. dev / build / test 流程

### 启动

```bash
pnpm install          # 需要 node >= 20，pnpm >= 9.9.0
pnpm build            # 首次 checkout 必须先 build —— components/index 会生成 .d.ts，
                      # tsconfig.json 里 types 字段指向这些文件，文档站类型检查会依赖它们
pnpm dev              # 启动 vitepress dev，跑 src/docs
```

`pnpm build` 实际跑 `pnpm --filter "./packages/**" run build`，每个 package 的 `build` 串了三段 Vite：

- `build:dev`  — `NODE_ENV=development`，保留 `__DEV__` 警告和开发分支
- `build:prod` — `NODE_ENV=production`，DCE 掉开发分支
- `build:iife` — jsdelivr / unpkg 用的单文件 UMD-ish 产物

不需要重新生成 `.d.ts` 时用 `pnpm build:noType` 加速。

### 测试

```bash
pnpm test                            # vitest workspace 跑所有包
pnpm exec playwright install         # 首次跑浏览器测试前需要装一次
pnpm --filter @lun-web/components test
```

- `components` 和 `react` 的测试跑在 **真浏览器**（Playwright + Chromium），因为它们要验 shadow DOM、自定义元素、布局。**不要** 换成 happy-dom，很多测试依赖真实布局 / CSSOM 行为。
- `core` / `theme` / `plugins` 用 `happy-dom`，`utils` 用 `node`。
- `utils/testSetup.ts` 注入了全局 `l(tagName, props, options)` —— 用它来挂载自定义元素，`afterEach` 会自动清理。

### 文档 / playground

`src/docs` 是 VitePress 站点。文档页很多是 `.vue.tsx`（Vue）或 `.react.tsx`（React），通过独立 tsconfig 编译。**新增组件时同步加文档页**，`utils/generateAndLinkDocs.js` 会把它们串到导航中。

## 4. 通用约定

### 4.1 TypeScript / 模块解析

- `paths` 别名（`common` / `config` / `custom` / `utils` / `hooks` / `@lun-web/*` / `data`）写在根 `tsconfig.json`，并 **同时在每个 package 的 `vite.config.ts`** 中镜像。新增别名时 **两处都要改**，否则编辑器类型和构建产物会对不上。
- `baseUrl` 已经移除（TS 6 弃用）。**不要再加回来**。path 别名相对 tsconfig 文件本身解析。
- 每个 package 的对外类型从顶层 `index.ts` 重导出 —— **不要** 直接 import `dist/`。

### 4.2 import

- `packages/components` 内部用别名：`import { ... } from 'common' / 'hooks' / 'utils' / 'config' / 'custom'`。只有为了避循环依赖才允许相对深路径（参考 `apiCustomElement.ts` 里显式避开 `../utils` 的注释）。
- 跨包永远用对外名：`import { ... } from '@lun-web/core' / '@lun-web/utils' / '@lun-web/plugins/vue'`。
- **绝对不要** 从另一个 package 的 `src/` 直接拉东西，必须走它的 `index.ts`。

### 4.3 命名

| 对象 | 约定 | 例 |
|---|---|---|
| 自定义元素 tag | `<namespace>-<comp>`，默认 `l-` | `l-button`、`l-form-item` |
| `defineCustomElement({ name })` 中的 name | kebab-case，**与 comp key 一致** | `name: 'button'` |
| 组件文件 | PascalCase `.tsx` | `Button.tsx`、`FormItem.tsx` |
| 副作用注册文件 | `<name>.define.ts` —— 只 import + 调用一次 | `button.define.ts` |
| 类型文件 | 与组件同级的 `type.ts` | `components/button/type.ts` |
| 组件目录名 | kebab-case 单数 | `components/form-item/` |
| Composables / hooks | camelCase，前缀 `use` | `useNamespace`、`useSetupEdit` |
| BEM class（`useNamespace` 生成）| `l-block`、`l-block__element`、`l-block--modifier`、`is-state` | `l-input__suffix`、`l-button--variant-soft`、`is-checked` |
| Shadow part 名 | `<part> <comp>-<part>`（两个 token） | 通过 `getCompParts` 得到 `part="root button-root"` |
| 实例 / 元素类型别名 | `iFoo` 是实例，`tFoo` 是元素构造器 | `iButton`、`tButton` |
| React 包装 | `L<Name>` | `LButton`、`LFormItem` |

### 4.4 组件骨架

`packages/components/src/components/<name>/<Name>.tsx` 都长一样。**抄现有的，不要发明新模式**。

```tsx
import { defineCustomElement } from 'custom';
import { useSetupEdit } from '@lun-web/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useCEStates, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { fooEmits, fooProps } from './type';

const name = 'foo';                                    // 与 tag 中的 kebab 后缀一致
const parts = ['root', 'inner'] as const;              // 对外暴露的 ::part 名
const compParts = getCompParts(name, parts);           // -> ['root foo-root', 'inner foo-inner']

export const Foo = defineCustomElement({
  name,
  props: fooProps,
  emits: fooEmits,
  // formAssociated: true,                             // 参与 <form> 时打开
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit(); // disabled/readonly/loading 继承
    const [stateClass] = useCEStates(() => ({ /* bool → is-* class 和 CustomStateSet */ }));

    useCEExpose({ /* 暴露在元素实例上的方法 */ });

    return () => (
      <div part={compParts[0]} class={stateClass.value}>
        <slot />
      </div>
    );
  },
});

export type FooExpose = { /* 通过 useCEExpose 暴露的方法 / getter */ };
export type tFoo = ElementWithExpose<typeof Foo, FooExpose>;
export type iFoo = InstanceType<tFoo>;

export const defineFoo = createDefineElement(name, Foo, { /* 默认 props */ }, parts, [/* 依赖的 define */]);
```

`foo.define.ts`：

```ts
import { defineFoo } from './Foo';
defineFoo();
```

然后把 comp key 加到 `packages/components/src/components/config/utils.ts` 对应的 shadow 模式列表（`openShadowComponents` / `closedShadowComponents` / `noShadowComponents`），**并在 `defineAllComponents()`（`packages/components/src/components/index.ts`）中按依赖顺序加入** —— provider（theme-provider、watermark、teleport-holder、accordion-group、table、tabs、form …）必须排在它们的子组件之前，因为 provide/inject 依赖 DOM 顺序的父查找。

### 4.5 Props

- 用 `common/propConstructor.ts` 里的 `PropString / PropNumber / PropBoolean / PropObject / PropResponsive / PropStrOrArr / PropObjOrFunc / Prop<T>()` 构造 prop。它们有缓存，且能让 Vue 的 CE attribute 强制转换工作。**不要** 手写 `{ type: String }`。
- prop 对象必须 `freeze({ ... })`。
- 公共 prop 包在 `common/` 中：`editStateProps`、`themeProps`、`openShadowCommonProps`。展开到组件 props 最前。
- **默认值不写在 prop 选项里**。写在 `createDefineElement(name, Comp, { defaults }, ...)`，这样可以被 `GlobalStaticConfig.defaultProps[compKey]` 在运行时覆盖。实现见 `components/src/utils/vueUtils.ts` 的 `setDefaultsForPropOptions`。
- 可能是三态的布尔 prop（open、status 等）用 `undefBoolProp`，默认 `undefined` 而不是 `false`。
- 接受任意类型但要把空字符串强制成 `true` 的 value 类 prop（option 的 `value` 等）用 `valueProp`。

### 4.6 Events / emits

- 用 `createEmits<{ eventName: PayloadType | undefined }>(['eventName', ...])` 声明。`undefined` payload 表示事件无 detail。
- **必须** 同时给出字符串数组（Vue 运行时需要），TS 信息来自泛型。
- 已有的事件包尽量复用：`closeEmits` / `openCloseEmits`。
- 事件以 `CustomEvent` 派发，`detail` 自动展开：单参数 → `detail = arg`，多参数 → `detail = args[]`。
- 事件名风格由 `GlobalStaticConfig.eventNameStyle` 控制（默认同时派发 `camel`、`kebab`、`pascal` 三种）。**不要** 在 `setup` 里手动 `dispatchEvent`，用 `emit`。

### 4.7 Slot、part、样式

- 用 `renderElement('icon', { name: 'x' })` 渲染其他自定义元素 —— tag 会按当前 namespace 拼，`exportparts` 会自动连。
- 每个可见元素都应该带 `part="..."`，从 `compParts` 取，**用下标引用，不要重复拼字符串**。
- class 由 `useNamespace(name)` 提供的工具生成：`ns.b()`、`ns.e('element')`、`ns.m('modifier')`、`ns.be / em / bm / bem`、`ns.is('state', bool)`、`ns.isOr('state', bool)`、`ns.v({ var: value })`（CSS 变量）、`ns.vn('varName')`。**绝不** 手拼 `l-...`。
- 主题相关 class（size / color / variant / dark / high-contrast）由 `ns.t` 提供，放到根元素上。

### 4.8 状态、ref、expose

- 永远从 `useSetupEdit()` 取 `editComputed`，用户交互门控用 `editComputed.interactive`（非 disabled、非 loading）或 `editComputed.editable`（再加上非 readonly）。**不要** 直接读 `props.disabled`。
- 用 `useCEStates(getStateBag)` 把布尔状态映射到 `CustomStateSet`（支持时）以及 `is-*` class / dataset。
- 用 `useCEExpose(methods, descriptors?)` 在自定义元素实例上暴露方法。`useExpose` 每个 Vue setup 只能用一次，这个 helper 可以叠加。
- 当 host 需要把 `focus()` / `blur()` / `click()` 委托给内部原生元素（input、button）时用 `interceptCEMethods(elRef)`。
- `useSetupEvent` 包裹 `emit`，让内部 observer 能拦截事件派发（form-item 的校验逻辑就靠它）。
- model：`useValueModel(props)`、`useOpenModel(props)`、`useCheckedModel(props)`。基于 `@lun-web/core` 的 `createUseModel`。**不要** 手写 `watch + emit('update')`。

### 4.9 表单集成

- 表单输入组件设 `formAssociated: true` 并用 `useValueModel`。form-item collector 会自动读取 value、校验规则、label。
- 完整校验规则 prop 集合在 `form-item/type.ts` 的 `formItemRuleProps`。`usePropsFromFormItem(props)` 返回 `{ status, validateProps, context }`，展开到内部 input。

### 4.10 SSR 与 provide/inject 顺序

- Provider 组件必须先于其子组件在 `defineAllComponents()` 注册。需要扩展时搜 `components/index.ts` 里 "found that provide and inject are strongly rely on the dom order…" 那段注释。
- 只有真正需要 hydratable 声明式 shadow root 时才用 `defineSSRCustomElement`，绝大多数组件走 `defineCustomElement`。

### 4.11 主题

- 默认主题用 `@lun-web/theme` 的 `importAllThemes()` 装载。每个组件的 SCSS 通过 `createImportStyle(compKey, scssString)`（静态）或 `createImportDynamicStyle(compKey, fn)`（context 主题变化时重算）注册。两个都被 `once()` 包了，重复调用安全。
- BEM 分隔符、CSS 变量前缀、`@layer` 包装都由 `GlobalStaticConfig` 决定。主题 SCSS 全部读 CSS 变量，**不要** 写死字面值。
- 色板来自 `@radix-ui/colors`。`themeColors`（accent）和 `grayColors`（neutral）是色板真源 —— 组件代码里不要凭空冒出一个新颜色，要先加到主题 token。

### 4.12 Plugins（Vue / Babel）

- `@lun-web/plugins/vue` 导出 `vUpdate`（compiler-core 指令变换：`v-update[:field]="expr"` 脱糖成 `:value` + `@update`）和 `vContent`（`v-content` 指令，是 content-visibility 版的 `v-show`）。
- `@lun-web/plugins/babel` 是 JSX 时期等价于 `vUpdate` 的实现，给走 Vue JSX 又想用 `v-update` 的项目用。
- 两者的 `@vue/compiler-core` 都在 `peerDependencies`，不在 `dependencies`，**不要破坏这点**。

### 4.13 React 包装

- `packages/react` 同时构建两套：`src/components/`（React <19 兼容）和 `src/components19/`（React 19 原生支持自定义元素）。`postinstall.cjs` 按安装的 React 版本切换入口。
- 包装文件是一行：`createComponent<Props, Instance>(compName, defineFn, props, emits)`（legacy）或 `createComponent<Props, Instance>(compName, defineFn)`（React 19）。**不要** 在包装里加单组件逻辑，把行为下沉到底层的自定义元素。

## 5. 守则（do / don't）

**Do**
- 改任何"组件形状"的东西之前，先读 `apiCustomElement.ts` 和 `useNamespace.ts`，这两个是地基且有不少非显式行为。
- `packages/components` 内部用别名 import（`common`、`hooks` …）。
- 静态配置对象（props、emits、列表）一律 `freeze()`。运行时部分位置会校验冻结状态。
- `createImportStyle` / `createImportDynamicStyle` 在模块顶层调用即可（内部已 `once`）。
- 新加组件 key 时，要同步加到 `openShadowComponents` / `closedShadowComponents` / `noShadowComponents` 中之一，以及 `defineAllComponents()`。
- 给 `packages/theme/src/scss/components/<comp>/` 加新 SCSS 时，同步在该目录的 `index.ts` 里加 `createImportStyle` 调用。

**Don't**
- **不要** import Vue 的 `defineCustomElement`，用 `custom` 别名里的本地版本。
- **不要** 在 `setup` 里 `dispatchEvent(new CustomEvent(...))`，用 `emit`。
- **不要** 直接读 `props.disabled`，走 `editComputed`。
- **不要** 手拼 BEM class 字符串，用 `useNamespace`。
- **不要** 把 `baseUrl` 加回任何 tsconfig。
- **不要** 把运行时默认值放在 prop 选项里，放到 `createDefineElement` 的第三个参数。
- **不要** 在 package 之间引入循环依赖。`utils` 什么都不能 import；`core` 不能 import `components`；`components` 不能 import `theme`。
- **不要** 写只是复述代码做了什么的注释。注释要有价值，只解释 **非显式的"为什么"** —— 一个 workaround、一个 Vue/Chrome 怪癖、一个 SSR 排序约束、一个 Spec 陷阱。代码里有不少好范例（搜 "must…"、"FIXME"、"bug starting from vue3.5"），学这种语气。
- **不要** 留死代码、半成品功能、为未来想象的抽象。库还在 alpha，表面积越小越好。

## 6. 速查表："xx 在哪做？"

| 任务 | 从这里开始 |
|---|---|
| 新增组件 | 选一个最像的现有组件（`button` / `switch` / `input` / `dialog`），整目录抄走，然后在 `config/utils.ts` 和 `defineAllComponents()` 里注册 |
| 给组件加新 prop | `<comp>/type.ts` —— 加到 props 对象 + 类型，不写默认值 |
| 改 prop 默认值 | `<Name>.tsx` 末尾的 `createDefineElement(name, Comp, { theKey: theValue }, ...)` |
| 加新 shadow part | `<Name>.tsx` 中的 `parts` tuple 末尾追加，用 `compParts[idx]` 引用 |
| 加新状态 class | `useCEStates` 对象字面量中加 key，样式里用 `[state="..."]` / `.is-...` |
| 加跨组件复用 hook | 涉及 custom element / namespace 的放 `packages/components/src/hooks/`；框架无关的放 `packages/core/src/hooks/` |
| 加纯 JS util | `packages/utils/src/<分类>/` —— 保持可 tree-shake，不依赖 Vue |
| 加新颜色或圆角档位 | `packages/theme/src/scss/common/` 加 token + `common/themeProps.ts` 改类型 |
| 加新 collector（父子收集） | `packages/core/src/composable/createCollector.ts`，参考现有（form、select、tabs、tree、table） |
| 加 Vue 编译期指令 | `packages/plugins/src/vue/` |
| 加文档页 | `src/docs/components/<comp>/index.md` + `_devTest.vue.tsx`（和 `.react.tsx`） |

## 7. 各 package 子指南

每个 package 都有自己的 `AGENTS.md`，列出该领域专属规则和指引。**在某个 package 里做实质改动之前先读它对应的子指南**。

- [`packages/components/AGENTS.md`](packages/components/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/components/AGENTS.zh-CN.md)
- [`packages/core/AGENTS.md`](packages/core/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/core/AGENTS.zh-CN.md)
- [`packages/utils/AGENTS.md`](packages/utils/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/utils/AGENTS.zh-CN.md)
- [`packages/theme/AGENTS.md`](packages/theme/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/theme/AGENTS.zh-CN.md)
- [`packages/plugins/AGENTS.md`](packages/plugins/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/plugins/AGENTS.zh-CN.md)
- [`packages/react/AGENTS.md`](packages/react/AGENTS.md) — 中文：[`AGENTS.zh-CN.md`](packages/react/AGENTS.zh-CN.md)
