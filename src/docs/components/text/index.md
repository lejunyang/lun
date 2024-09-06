---
title: Text 文本
lang: zh-CN
---

## 基本使用

Text组件可以直接使用`text`属性设置文本内容，也可以直接在children中渲染文本。但需要注意的是，某些情况必须使用属性设置，例如下面介绍的`ellipsisOffset`以及`ellipsis=center`

<!-- @Code:basicUsage -->

## 代码片段

使用`as="code"`可以将文本渲染为代码片段

:::warning 主题属性
文字组件的主题属性，除了size可以继承父组件或使用全局设置，其他属性均需要在组件上直接设置

这是因为shadowRoot里没有再包裹一层元素，可能会考虑变更
:::

<CompThemePanel comp="text" includeContrast :other="{ text: 'Code', as: 'code' }" />

## 引用片段

使用`as="blockquote"`可以将文本渲染为引用片段

<!-- @Code:blockquote -->

## 单行超出隐藏

添加`ellipsis`属性即可使元素在限定宽度的容器中隐藏超出的内容，并显示省略号。省略号的位置默认为文档方向结束(`end`)位置，可以设置`start`或`center`，其他所有值均视为`end`。

:::warning 注
谨慎使用`ellipsis=center`，其利用float实现，且依赖于元素的高度和行高一致。float左边可能会出现一些空白，需要手动调整右边的宽度以及设置`text-align`、`word-break`等等，比较不友好，而且在rtl下句尾的符号显示不正确。

若以后原生支持设置为[中间](https://github.com/w3c/csswg-drafts/issues/3937)则火速弃用现在的实现

推荐使用`ellipsisOffset`设置固定的偏移字符数来让省略号在中间显示，见下一小节
:::

<!-- @Code:ellipsis -->

## 省略号偏移

通过`ellipsisOffset`可设置省略号偏移的字符数，偏移的字符数以`ellipsis`的位置决定，例如当为`end`时偏移从`text`末尾算起，不支持`ellipsis=center`

<!-- @Code:ellipsisOffset -->


## 不同颜色

文字颜色默认受主题中的`grayColor`影响，主动设置`color`属性可以使文字颜色为主题色，但如果同时设置了`grayColor`属性，则优先使用灰色。

<!-- @Code:colors -->

## 不同大小

不同于一般的组件，Text组件支持1～9的size设置

<!-- @Code:sizes -->