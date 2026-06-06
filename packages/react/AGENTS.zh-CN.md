# `@lun-web/react` — AGENTS.zh-CN.md

> `@lun-web/components` 自定义元素的轻薄 React 包装。**两套并行构建**：React <19（legacy）和 React 19（原生支持自定义元素）。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 目录

```
src/
  createComponent.ts     — legacy（React <19）包装用的工厂
  createComponent19.ts   — React 19 包装用的工厂（体积小很多）
  components/            — legacy 包装，每个元素一个文件
  components19/          — React 19 包装，同样一组组件，函数体更简单
  hooks/                 — React hooks，对应 core 里有用的 hook
  utils/                 — React 侧小帮手
postinstall.cjs          — install 时根据已装 React 版本决定暴露哪个入口
```

构建产物双树（legacy 的 `build:dev` / `build:prod` 加 React 19 的 `build19:dev` / `build19:prod`），由 `postinstall.cjs` 选择正确的那套并暴露。

## Legacy 包装（`createComponent`）

React <19 对自定义元素的 property 赋值和事件监听没有原生支持。`createComponent` 手动还原：

- `forwardRef` + `useImperativeHandle` 暴露底层元素。
- 遍历 `reactProps`，把每个 key 分类成：已知事件（匹配 `emits` 里的 `on<Capitalized>`）、已知 prop（匹配 `props` 的 key 或 `openShadowCommonProps`）、透传（变成宿主上的 attribute）。
- 用 `useLayoutEffect` 把 property 命令式地写到元素上（不然 React 会序列化成字符串），同时挂/卸事件监听。
- 用 `useRef` 跟踪上一次渲染的 prop key 集合，下一次渲染把被删的 key "unset"。

包装文件就一行：

```ts
// components/Foo.ts
import { fooEmits, fooProps, defineFoo, FooProps, iFoo } from '@lun-web/components';
import createComponent from '../createComponent';
export const LFoo = createComponent<FooProps, iFoo>('foo', defineFoo, fooProps, fooEmits);
if (__DEV__) LFoo.displayName = 'LFoo';
```

## React 19 包装（`createComponent19`）

React 19 原生把未知 prop 转发为元素 attribute / property，并尊重自定义事件监听器。所以包装非常薄 —— 只是调一下 `defineFoo` 副作用（注册自定义元素）然后渲染 JSX 标签。导出形状（`LFoo`）保持一致，使用者无感。

## 强制规则

- **包装里不写每组件逻辑**。一个包装文件就是一行 + `displayName`。要加逻辑就推回底层自定义元素。
- **`@lun-web/components` 里的每个组件，legacy 和 React 19 的包装都必须存在**，保持同步（同名、同泛型实参）。
- **React + Vue + 自定义元素 是三方依赖**。不要引入 React 服务端内部模块。
- **`postinstall.cjs` 是 API 的一部分**。别破坏 —— 它决定使用者拿到哪套产物。

## 给新组件加包装

1. 确认组件在 `@lun-web/components` 已存在（`define<Name>`、`<Name>Props`、`i<Name>`）。
2. 创建 `src/components/<Name>.tsx`（legacy）—— 一行 `createComponent<Props, Instance>(name, defineFn, props, emits)`。
3. 创建 `src/components19/<Name>.tsx` —— 一行 `createComponent<Props, Instance>(name, defineFn)`。
4. 在 `index.ts` 导出 `L<Name>`。
5. `__tests__/` 下的测试可以照抄某个 components 测试（用 `vitest-browser-react` 挂载，先在 React 组件上断言，再验证元素确实挂到了 DOM）。

## Don't

- **不要** 绕开 `createComponent` / `createComponent19`。统一 property/event 语义就是它们的全部意义。
- **不要** 加底层元素没有的"包装级"特性（自定义 prop、自定义事件）—— 会与 Vue / 原生用户分叉。
- **不要** 在这里加 `@lun-web/core` 已有的 hook。需要 React 风味就 **包装** core 那个，别重写。
- **不要** 用版本特定路径 import React 类型，用 `@types/react` 入口；legacy 怪癖在构建期处理。
