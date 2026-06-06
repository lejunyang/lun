# `@lun-web/components` — AGENTS.zh-CN.md

> 跨框架 Web Components 组件库。自定义元素 ⊕ Shadow DOM，作者层用 Vue 3。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 架构（动手前先读一遍）

```
src/
  custom/             # 改造过的 defineCustomElement、虚拟父链接 —— 绕开它前先读懂它
  components/<name>/  # 一个元素一个目录（Name.tsx + name.define.ts + type.ts [+ helpers]）
  components/config/  # GlobalStaticConfig、GlobalContextConfig、组件列表、默认值
  common/             # prop 工厂、主题/编辑态 prop 包、emit 帮手、BEM 粘合
  hooks/              # 组件感知 hooks（useNamespace、useCEStates、useCEExpose、model …）
  utils/              # 自定义元素注册帮手（createDefineElement、renderElement …）
  types/              # 生成的 Vue/React/HTML 标签类型 .d.ts（构建产物目标）
```

各层职责：

- **`custom/apiCustomElement.ts`** —— `defineCustomElement` 的重载、`VueElement` 类、attribute ⇄ prop 反射、跨 shadow 的 `_findParent`、`adoptedStyleSheets` 注入、`emit → CustomEvent` 桥接、HMR 全在这里。任何"Vue 行为 X、元素表现 Y"的疑问答案都在它里面。**绝不** import Vue 自带的 `defineCustomElement`。
- **`components/config/`** —— namespace（默认 `l-`）、BEM 分隔符、默认 prop 覆写、attribute 变换、事件名风格、断点、math/date 预设、组件 key 注册表的唯一真源。`GlobalStaticConfig` 在 import 时锁定（要改就必须在 import 组件之前改）；`GlobalContextConfig` 是响应式的，按树作用。
- **`components/<name>/`** —— 基本积木。每个目录自包含，只允许 import 自 `common`、`hooks`、`utils`、`custom`、`config`、`@lun-web/core`、`@lun-web/utils`、兄弟组件（`../<sibling>`）和 `vue`。**不要** 钻别的 package 的 `src/`。
- **`common/propConstructor.ts`** —— `PropString`、`PropNumber` … 这些缓存过的 prop 工厂封装了 Vue prop 选项。**用它们，不要手写 `{ type: String }`**。
- **`hooks/`** —— 依赖自定义元素运行时的 hooks（namespace、expose、state、model）。框架无关的 hooks 放 `@lun-web/core`。
- **`utils/`** —— 注册 + 样式帮手（`createDefineElement`、`renderElement`、`createImportStyle`、`createImportDynamicStyle`）。

## 新增组件的机械步骤

1. 选一个最像的现有目录抄走（"包薄一层原生 element"抄 `button`，"管理 open 状态"抄 `dialog`/`popover`，"父子收集"抄 `select`/`tree`）。
2. 创建：
   - `<Name>.tsx` —— 导出 `<Name>`（元素类）、`<Name>Expose`、`t<Name>`、`i<Name>`、`define<Name>`。结尾必须 `createDefineElement(name, <Name>, defaults, parts, [依赖 define])`。
   - `<name>.define.ts` —— 严格两行：import + `define<Name>()`。`import '@lun-web/components/define/<name>'` 解析到的就是它。
   - `type.ts` —— `<name>Props`（冻结）、`<name>Emits`（通过 `createEmits`）、`<Name>SetupProps`、`<Name>EventProps`、`<Name>EventMap`、`<Name>Props`。
   - `index.ts` —— `export * from './<Name>'; export * from './type';`
3. 在 `components/config/utils.ts` 对应列表中追加 kebab key：
   - `openShadowComponents` —— 默认
   - `closedShadowComponents` —— 隐藏实现细节（`watermark`）
   - `noShadowComponents` —— 仅渲染（`custom-renderer`、`virtual-renderer`）
4. 把 `define<Name>` 加到 `components/index.ts` 的 `defineAllComponents()`，**按依赖顺序** 排（provider 在前 —— 参考已有数组的位置）。
5. 在 `packages/theme/src/scss/components/<name>/` 加 SCSS，并在该目录 `index.ts` 通过 `createImportStyle(name, scssString)` 注册。
6. 在 `src/docs/components/<name>/` 加文档页。
7. 行为值得验证的话，在 `__tests__/components/<Name>.test.tsx` 加真浏览器测试。最低也要覆盖组件特有的不变量（interactive + disabled 门控、model 更新、暴露的方法）。

## 模式 / 反模式

| ✔ Do | ✘ Don't |
|---|---|
| `const ns = useNamespace(name)`，再用 `ns.b/e/m/be/em/bm/bem/is/isOr/v/vn` | 手拼 `'l-button__inner'` |
| `const [stateClass, states] = useCEStates(() => ({ checked, loading }))` | 自己根据 `props.*` 切 class |
| `const [editComputed, editState] = useSetupEdit()` 并用 `editComputed.interactive` / `.editable` 门控 | 直接读 `props.disabled` / `props.loading` |
| `useValueModel(props)` / `useOpenModel(props)` / `useCheckedModel(props)` | 手写 `watch(() => props.value, ...)` + `emit('update', ...)` |
| `useCEExpose({ method() {...}, get readonly_value() {...} })` | 直接给 `vm.exposed` 赋值 |
| `interceptCEMethods(innerInputRef)` 委托 `focus/blur/click` | 默认行为不会聚焦内部原生元素 |
| `renderElement('icon', { name: 'x' })` | `<l-icon name="x" />`（写死 namespace） |
| `freeze(props)` 和（通过 `createEmits`）`freeze(emits)` | 可变的 prop/emit 对象 |
| `parts = ['root', ...] as const; compParts = getCompParts(name, parts); part={compParts[0]}` | 每处现拼 part 字符串 |
| 默认值放 `createDefineElement(name, Comp, { defaults }, ...)` | 把 `default:` 写在 prop 选项里 |
| 三态布尔（`open`、`disabled` …）用 `undefBoolProp` | 依赖 Vue 默认的 `false`（会断继承链） |
| `createEmits<{ event: Payload | undefined }>(['event'])` —— 类型 + 字符串列表都必须 | 只给数组没类型，或只给类型 Vue 看不到 |

## 常用子系统

### `useSetupEdit`

在 `@lun-web/core`。返回 `[editComputed, editState]`。通过 Vue provide/inject + `apiCustomElement` 的跨 shadow 父查找实现继承。`editComputed.interactive = !disabled && !loading`；`editComputed.editable` 再加 `&& !readonly`。`editState` 用来在异步过程中本地设 `loading`。

### `useNamespace`

返回 BEM 帮手 + 主题粘合，同时把组件加入主题继承链（通过 `getVmParent`/`setVmParent` 做父元素发现）。**调用它是必须的**，否则主题 class（`ns.t`）和暴露的 `size`/`isDark` 都拿不到。

### Collectors（父子收集器）

实现在 `@lun-web/core/src/composable/createCollector.ts`。有父子关系的组件（form、select、tabs、tree、table、accordion、radio-group、checkbox-group）**必须** 用 collector —— 它负责 DOM 顺序的子列表、跨 shadow 查找、排序、动态增删，并提供 `state.parentMounted` 供 SSR。`getParentEl`/`getChildEl` 已经在 `common/index.ts` 的 `getCollectorOptions(name, sort?, skipInternalChildren?, onlyForProp?)` 中预接到 `vmToCE`。

### 样式注册

```ts
// once 保护过，模块顶层调用安全：
export const importButtonStyle = createImportStyle('button', buttonScss);
export const importDynamicButton = createImportDynamicStyle('button', (vm, comp, context) => `:host { ... }`);
```

静态样式生成元素级的 `adoptedStyleSheets`。动态样式在 context 主题变化时重算。变体通过 `createImportStyle(comp, scss, variantName)` 注册。

### `formAssociated`

参与 `<form>` 的组件在 `defineCustomElement` 选项里设 `formAssociated: true`。`apiCustomElement` 会 `attachInternals()` 并把 `_internals` 暴露到元素上。配合 `useValueModel` 和 form-item collector 完成全套表单集成。

### Transition

用 `getTransitionProps(props, 'remove', 'scaleOut')`。`addHandlersIfHeight` 会自动把 `height` 过渡接到 Web Animations API（或支持 `calc-size(auto, size)` 时用 CSS）—— **不要** 在每个组件里自己写 height 动画。

## 测试

- 真浏览器（Playwright）。用 `utils/testSetup.ts` 中的全局 `l(tag, props, options)` helper 挂载。
- 始终通过 `el.shadowRoot!.querySelector(...)` 在 shadow 里取节点，不要 query light DOM。
- `vi.useFakeTimers()` + `vi.advanceTimersByTimeAsync` 可以用，但 **注意：真实布局不会跟着暂停**。需要等动画时等真实帧（`raf`），别用合成时间。
- 测试结束后元素自动清理（除非带 `data-persist` 属性）。

## 易踩坑（出自代码内注释）

- Vue 3.5 改了布尔属性反射：`true` **不再** 序列化到 data 属性上。传 `data-*` 时先 `String(value)`。
- `disconnectedCallback` 后排 `nextTick`：元素可能只是在同一个父节点内被移动了；我们用 `_connected` 来判断是否真要 unmount。
- `ShadowRoot.parentNode` 是 `null`，跨 shadow walk 用 `host` 和 `assignedSlot`。
- `defineCustomElement` 的 `name` 必须匹配 `ComponentKey` —— `preprocessComponentOptions` 据此找你的默认值/样式/事件初始化。
- `custom/` 里避免 `import * from '../utils'` —— 见 `apiCustomElement.ts` 的注释，避开 `useSlots → VueCustomRenderer` 的循环依赖。

## 拿不准时

- 在代码里搜现有用法，几乎永远比凭感觉强。
- Vue 那侧的机制可以参考上游 `defineCustomElement` 源码，但 **以本地 fork 为准**。
- Web Components 机制（CustomStateSet、ElementInternals、声明式 shadow DOM）以 MDN 为准；本项目的 polyfill / 降级路径以 `apiCustomElement.ts` 的代码为准。
