---
title: Input 输入
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## placeholder

<!-- @Code:placeholder -->

## 插槽

<!-- @Code:slots -->

## 多值
`maxTags`属性可限制最大标签数量，`wrapTags`属性可控制标签过多时是否换行
<!-- @Code:multiple -->

## 展示字数

没有设置`maxLength`时展示当前字数，设置`maxLength`时两者一起展示。多值时以当前输入的字符为准

<!-- @Code:showLengthInfo -->

## 数字输入

通过`stepControl`属性可控制数字步进器的种类，可选值有`up-down`和`plus-minus`，其他任意值视为不展示步进器

<!-- @Code:typeNumber -->

## 数字限制

<!-- @Code:restrictNumber -->

## 不同变体

<!-- @Code:differentVariants -->

## 自定义更新时机
通过`updateWhen`属性来自定义输入值的更新时机，可选值有：
- `input`: input事件时触发更新，当`multiple`为true，在输入过程中遇到`separator`便立即更新
- `not-composing`: input事件时触发更新，处于composition时不更新
- `change`: change事件时触发更新
- `auto`: 当`multiple`为true时相当于`change`，当为false时相当于`not-composing`

同时，`updateWhen`支持设置为数组，这通常用于`multiple`为true的时候
<!-- @Code:updateWhen -->

## 自定义字符限制时机
`restrict`, `maxLength`, `replaceChPeriodMark`这三个属性会限制输入的内容，而`restrictWhen`决定了限制的时机，其可选值有`beforeInput`, `input`, `not-composing`, `change`
:::warning 注
不建议将restrictWhen设为input，在input事件中限制字符输入，如果此时处于中文输入composition下会导致字符被吞，但是输入法仍然显示你输入的字符，而且会出现怪异的行为。推荐设为not-composing
:::
<!-- @Code:restrictWhen -->

## 自定义值转换时机
`transformWhen`用于设置`transform`的时机，可选值有`input`, `not-composing`, `change`

<!-- @Code:transformWhen -->
:::warning 注
`updateWhen`必须包含`transformWhen`，值才会被转换
:::

## 自定义渲染

`renderer`插槽可用于自定义渲染输入框在未编辑且未被悬浮时的展示内容

<!-- @Code:renderer -->

## 浮动标签

<!-- @Code:floatLabel -->

:::warning 注
当使用浮动标签时，优先取`label`属性作为浮动标签，若没有则取`placeholder`
:::
