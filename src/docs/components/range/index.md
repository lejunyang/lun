---
title: Range 滑块
lang: zh-CN
---

## 基本使用

默认`min=0`，`max=100`，`step=1`，不在有效范围的值会自动修正到边界值。若不指定`precision`，会自动取`step`的小数位数。

支持大数和高精度小数，需要将`valueType`设为`number-text`，值会变为字符串

支持键盘操作，聚焦后可用上下左右箭头增减值

<!-- @Code:basicUsage -->

## 多值

`value`可以设置为数组，当为数组时会渲染对应个数的拖拽块，用于选择连续的多个范围

<!-- @Code:multiple -->

## 标记

通过`labels`属性可以若干点对应的标记，它为一个对象，对象的 key 为标记的数字位置（key 也可以为 `start` 或 `end`，代表最小值和最大值的位置），value 为标记内容

<!-- @Code:labels -->

## 范围可拖拽

当`value`为数组且设置`trackDraggable`后，可以直接拖拽多值组成的轨道本身

<!-- @Code:trackDraggable -->
