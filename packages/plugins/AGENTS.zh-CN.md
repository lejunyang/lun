# `@lun-web/plugins` — AGENTS.zh-CN.md

> 编译期帮手：Vue compiler-core 指令变换（`v-update`、`v-content`）以及给 Vue JSX 用的 Babel 等价物。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 目录

```
src/
  vue/
    vue.index.ts       — barrel：重导出 vContent + vUpdate
    vContent.ts        — 运行时指令（apiCustomElement 里 app.directive('content', vContent) 注册）
    vUpdate.ts         — 编译期指令变换：v-update[:field]="expr" → :value + @update
  babel/
    babel.index.ts     — barrel：重导出 vUpdate + rUpdate
    vUpdate.ts         — 镜像 Vue v-update 的 Babel JSX 变换
    rUpdate.ts         — Babel 变换变体（React 侧）
  __test__/            — happy-dom 单测
```

包的 `exports`：

- `'./vue'` —— 由用户构建工具（Vite、Nuxt …）编译，传给 `@vue/compiler-core` 选项。
- `'./babel'` —— 放进 Babel preset/plugin 列表，给用 Vue JSX 或 React JSX 的项目用。

## 各插件做什么

### `vUpdate`（Vue 模板，编译期）

`v-update:field="expr"` 重写成两个 attribute：

```html
<l-input v-update:value="state.foo" />
<!-- 变成 -->
<l-input :value="state.foo" @update="state.foo = $event.detail.value" />
```

- arg（`:field`）控制绑哪个 prop（默认 `value`；`v-update-checked` 也工作）。
- `expr` 必须是成员表达式（`a.b`、`arr[0]`）—— 变换会赋值到它。
- 实现：`src/vue/vUpdate.ts` 中的 `createCustomEventModel({ name, regex, getTarget, event })`。需要再造一个糖（例如 `v-sync`）就用这个工厂。

### `vContent`（Vue 运行时指令）

`v-content="bool"` 切换 `content-visibility: hidden`（或降级为 `display: none`）。`apiCustomElement` 已经自动注册（`app.directive('content', vContent)`）。组件里不需要 import。

### Babel `vUpdate` / `rUpdate`

语义和 Vue 编译期 `v-update` 一致，在 Babel JSX 变换阶段做，让 `*.tsx` 文件里也能用这个糖（Vue JSX 和 React JSX 都支持）。

## 强制规则

- `@vue/compiler-core` 是 **peer dependency**，不是 dependency。`@babel/core` / `@babel/types` 同理。**不要挪动**。
- 把每个导出当作稳定的公共 API —— 用户把它接到 build 配置里，破坏性变更很难排查。
- **不要** 发布依赖 `@vue/runtime-dom` 的运行时代码。这些插件跑在编译期（Vue compile / Babel transform）。唯一的运行时指令（`vContent`）小且自包含。

## 新增指令

1. 决定是编译期（Vue compiler transform）还是运行时（Vue ObjectDirective）。
2. 编译期，照 `vUpdate.ts` 抄：
   - 用 `@vue/compiler-core` 的 `createStructuralDirectiveTransform`。
   - 校验 node type（必须 `NodeTypes.ELEMENT` 等）。
   - 往 `node.props` push 合成的 `DirectiveNode`。**不要** 原地改 `exp`。
3. 运行时，照 `vContent.ts` 抄：
   - 导出一个 `ObjectDirective`，按需实现 `beforeMount`、`mounted`、`updated`、`unmounted`。
   - 用私有 `Symbol` 作为 key 存每个元素的状态（`vContentVisibilityOriginal` 是好模板）。DEV-only 的 label（`__DEV__ ? 'name' : ''`）能省 prod 体积。
   - 如果要自动可用，在 `apiCustomElement.ts` 的 `configureApp` 里注册。
4. 加到 `vue.index.ts`。在 `__test__/` 下加测试。

## Babel 侧

`@babel/types` 是结构化表示，`@babel/plugin-syntax-jsx` 是解析器插件。`vUpdate.ts` / `rUpdate.ts` 遍历 JSX 表达式，找到指令属性，重写成 `value` + `onUpdate` 对。**保持两侧语义一致** —— 漂移会出现"模板里行，JSX 里不行"的 bug。

## Don't

- **不要** 写依赖 `vue`（运行时）的代码。只用 `@vue/compiler-core` / `@vue/runtime-core` 的类型（在必要处）。
- **不要** import `@lun-web/components` —— 本包在依赖图里设计上就在 components 之下。
- **不要** 加需要读用户项目配置的构建期 helper。插件必须开箱可用。
