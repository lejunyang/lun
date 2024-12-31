---
title: Calendar 日历
lang: zh-CN
---

:::warning 注
Highly experimental
:::

## 基本使用

默认选择单个日期

支持键盘导航，当聚焦于日期单元格时可通过上下左右箭头来移动，Enter 键选中（当为多选且非范围选择时，Enter 也可用于取消选中），动画会根据移动的方向来展现

<!-- @Code:basicUsage -->

## 日期范围选择

添加`range`属性则可以选择日期范围

<!-- @Code:range -->

## 日期多选

添加`multiple`可选择多个日期

<!-- @Code:multiple -->

## 日期范围多选

同时设置`multiple`和`range`时可选择多个日期范围，多个范围之间不能重叠，但一个区间的结尾可以与另一个区间的开始相同

<!-- @Code:multipleRange -->

## 横向滚动

横向滚动有利于移动端的体验，便于左右滑动切换，所以目前在移动端会默认开启横向滚动，额外渲染前后各一个月。若需要在 PC 端也开启，可通过`scrollable`属性设置，然后便可通过shift加滚轮或触摸板横向滚动，开启后将不再有上下移动的动画

:::warning 注
由于实现限制，无法快速连续滚动

FIXME 高刷新率好像有问题
:::

<!-- @Code:scrollable -->

## 隐藏预览日期

日期面板默认固定显示6行，空白的单元格填充上一个月和下一个月的日期，这些填充的日期被称为预览日期，有两个属性可以控制该行为：

- `hidePreviewDates`: 隐藏所有预览日期
- `removePreviewRow`: 若该行所有日期均为预览日期，则移除该行

下面的示例可以清晰地看到区别

<!-- @Code:hidePreview -->