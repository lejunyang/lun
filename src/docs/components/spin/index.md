---
title: Spin 加载中
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

:::info 注
Spin会继承主题中的size和color，同时也可以通过设置font-size和color内联style来设置Spin的大小和颜色，其优先级更高
:::

## 延迟展示

设置`delay`即可延迟展示spin，通常用于在手动控制spinning时，延迟展示以防止持续时间过短而造成的闪烁
<!-- @Code:delay -->

## 作为容器

正常情况Spin不接收子节点，当添加`asContainer`属性后便可以作为容器组件，使图标显示在容器中央，此时也会接受`tip`属性或插槽

<!-- @Code:asContainer -->