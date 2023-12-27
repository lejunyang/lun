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

<!-- @Code:multiple -->

## 展示字数

<!-- @Code:showLengthInfo -->

## 不同变体

<!-- @Code:differentVariants -->

## 自定义更新时机
通过`updateWhen`属性来自定义输入值的更新时机，可选值有：
- `input`: input事件时触发更新，当`multiple`为true，在输入过程中遇到`splitter`便立即更新
- `not-composing`: input事件时触发更新，处于composition时不更新
- `change`: change事件时触发更新
- `auto`: 当`multiple`为true时相当于`change`，当为false时相当于`not-composing`

<!-- @Code:updateWhen -->

## 自定义字符限制时机
`restrictWhen`

## 自定义值转换时机
`transformWhen`

## 自定义渲染

`renderer`插槽可用于自定义渲染输入框在未编辑且未被悬浮时的展示内容

<!-- @Code:renderer -->

## 浮动标签

<!-- @Code:floatLabel -->

:::warning 注
当使用浮动标签时，优先取`label`属性作为浮动标签，若没有则取`placeholder`
:::
