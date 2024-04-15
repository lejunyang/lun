---
title: 属性继承
lang: zh-CN
---

## 主题继承

具有主题的组件均自带[主题相关属性](/components/theme-provider/#主题属性)，如果组件未设置，则继承父组件的主题属性；若没有父组件，则使用[`GlobalContextConfig`](/components/context-config/)中的theme

:::info 注
父组件指的是树形结构中上级提供了相关继承状态的自定义元素，可以跨越多个DOM，不一定是 parentElement
:::

## 编辑状态继承

本组件库定义了三个与编辑相关的状态：`disabled`，`readonly`，`loading`，具有编辑状态的组件都会有以下属性：

```ts
type EditStateProps = {
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  mergeDisabled?: boolean;
  mergeReadonly?: boolean;
  mergeLoading?: boolean;
};
```

编辑状态默认均为 undefined，其具有继承性，其下的子组件会继承父组件的状态。然而，当组件自身的编辑属性不为 null 或 undefined，其优先使用自身设置的属性，而 mergeXXX 属性用于影响这个行为，当其为 true 时合并父组件和自身设置的值。mergeXXX 同样具有继承性

按钮、输入组件、表单组件具有编辑属性。为了方便控制子元素，某些容器组件也加了编辑属性，比如 Dialog、DocPip、ThemeProvider。值得注意的，**Dialog 故意设置了不继承父组件的编辑属性**，毕竟弹窗是一个独立的交互空间。

<!-- @Code:editState -->
