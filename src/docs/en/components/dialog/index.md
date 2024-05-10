<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->
---
title: Dialog 弹窗
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

:::warning 注
- 默认情况下会组件使用Top Layer Dialog（若支持），此时即使不渲染mask，也无法与弹框之外元素的交互。若需要在无mask时与其他元素交互，请设置`noTopLayer`
- 浏览器默认会将焦点限制在Top Layer Dialog内部，但需要注意的是在聚焦到最后一个元素后，再使用Tab导航并不会跳回第一个可聚焦元素。然而在开启`noTopLayer`时，内部模拟的focus trap则会在弹框内部循环聚焦。如果需要Top Layer Dialog也遵循这个行为，请使用`alwaysTrapFocus`属性。
- 如果弹框为Top Layer或存在蒙层，内部将会锁定页面滚动，直至最后一个锁定页面滚动的弹框关闭
:::

## 静态方法

`Dialog`有一些静态方法，用于方便在js中直接创建并打开弹框

<!-- @Code:staticMethods -->

:::info 注
`destroyAll`方法可以直接销毁所有由静态方法创建的对话框，由于是直接从文档中移除，所以不会触发`close`或`afterClose`事件，想要正常关闭所有可以使用`closeAll`方法
:::


## 嵌套

嵌套打开多个模态框时只会展示一个蒙层，防止因为多个蒙层而越来越黑

<!-- @Code:nested -->