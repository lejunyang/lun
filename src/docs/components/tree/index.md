---
title: Tree 树
lang: zh-CN
---

:::warning 注
Highly experimental
:::

## 基本使用

<!-- @Code:basicUsage -->

## 节点可选择

设置`selectable`属性便能使树节点可选择，当其为`label`时只能通过点击文字以选中节点，其他真值时视为整行(`line`)可选

使用`selectMode`可控制选择模式：
- `multiple`：可单击选择多个节点
- `ctrl-multiple`：按住Ctrl键时可选择多个节点，否则为单选
- 其他值：单选

<!-- @Code:selectable -->

## 节点可勾选

<!-- @Code:checkable -->