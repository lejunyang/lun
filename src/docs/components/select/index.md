---
title: Select 下拉列表
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## 多选
使用`hideOptionWhenSelected`属性可以隐藏已选择选项

<!-- @Code:multiple -->

## 过滤

<!-- @Code:filter -->

## 自由输入
使用`freeInput`可以使输入框自由输入并生成新的选项，单选时生成的选项会展示在下拉列表中，多选时不会展示，而是在更新后对输入内容进行分词并生成新选项

<!-- @Code:freeInput -->

## 常用按钮

多选时可通过`commonButtons`属性来配置常用按钮，支持的按钮有`selectAll`(全选), `reverse`(反选), `clear`(清除)

其可以设置为布尔值，若为 true 则展示全部按钮；也可以单独对每个按钮进行配置，支持 Button 的全部属性

<!-- @Code:multipleWithBtns -->

## 选项分组

<!-- @Code:group -->

## 自定义选项字段
默认情况下options中的每一个option应为

```ts
{ value: any; label?: string; children?: Option[] }
```

通过`optionNameMap`属性可重新映射这三个字段
<!-- @Code:customOptionFields -->

## 无选项

<!-- @Code:noOptions -->

## 函数式选项

<!-- @Code:functionOption -->

## 不同颜色

<!-- @Code:differentColors -->

## 不同大小

<!-- @Code:differentSizes -->

## 主题继承

`select-option`会继承`select-optgroup`或`select`的主题设置，优先从近

多选时，输入框中的 tag 会继承其对应`select-option`的主题设置

<!-- @Code:tagInheritTheme -->
