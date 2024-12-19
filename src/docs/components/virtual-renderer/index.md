---
title: VirtualRenderer 虚拟渲染
lang: zh-CN
---

:::warning 注
Highly Highly Highly experimental
:::

## 基本使用

虚拟项推荐使用绝对定位进行渲染，性能更佳。若因布局限制无法使用绝对定位，则可以添加`staticPosition`属性，其会自动给包裹的元素设置 transform，当然你可以给自行所有元素设置 transform

<!-- @Code:basicUsage -->

## 虚拟纵向瀑布流

通过`lanes`属性设置固定的列数，渲染项使用绝对定位按如下示例便可实现瀑布流的效果

<!-- @Code:verticalMasonry -->
