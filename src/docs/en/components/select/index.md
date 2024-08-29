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

## Popover属性

`select`直接依赖于`popover`实现，故`popover`支持的属性也可以直接传递给`select`，除了以下内部写死的

```text
'open',
'content',
'contentType',
'popWidth',
'triggers',
'showArrow',
'children',
'toggleMode',
'useTransform',
'placement'
```

<!-- @Code:popover -->

:::warning 注
由于`select-option`和`select-optgroup`依赖于dom结构来获取select context，而type="teleport"时它们被移动到别的位置，虽然目前做了兼容，但可能存在问题

而且type="teleport"时插槽均失效，你不可以直接在`select`下渲染选项，必须通过`options`属性，故不推荐`select`使用type="teleport"
:::
<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->