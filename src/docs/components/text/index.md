---
title: Text 文本
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

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
