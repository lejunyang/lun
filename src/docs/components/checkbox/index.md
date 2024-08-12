---
title: Checkbox 复选框
lang: zh-CN
---

<CompThemePanel comp="checkbox" includeContrast includeDisabled :other="{ label: 'label', checked: true }" />

## 基本使用

<!-- @Code:basicUsage -->

## 选项组

`checkbox-group`下的任一`checkbox`，可通过添加`checkForAll`属性使其变为控制该组全选状态的复选框。如果想在选项组外面使用全选，也可以通过直接调用`checkbox-group`元素上的方法来实现

<!-- @Code:checkboxGroup -->

:::warning 注
全选会无视 disabled 选项，但是 readonly 选项会被改变

没有 value 的选项无法进行选择，其只会跟随所在 group 的全选状态而改变
:::

## 卡片选项组

<!-- @Code:card -->

## 纵向选项组

<!-- @Code:verticalGroup -->