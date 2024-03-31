---
title: Dialog 弹窗
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

:::warning 注
- 默认情况下会组件使用Top Layer Dialog，此时即使不渲染mask，也会阻止弹框之外元素的交互
- 浏览器默认会将焦点限制在Top Layer Dialog内部，但需要注意的是，在聚焦到最后一个元素后，再使用Tab导航并不会跳回第一个可聚焦元素。然而在开启`noTopLayer`时，内部模拟的focus trap则会在弹框内部循环聚焦。如果需要Top Layer Dialog也遵循这个行为，请使用`alwaysTrapFocus`属性。
:::

## 静态方法

`Dialog`有静态方法`open`，方便在js中直接创建并打开弹框

<!-- @Code:staticMethods -->