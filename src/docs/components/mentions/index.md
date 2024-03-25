---
title: Mentions 提及
lang: zh-CN
---

该组件基于`contenteditable`实现，但是目前`Selection in Shadow DOM`有问题，各浏览器实现各不相同，参考[这个](https://stackoverflow.com/questions/62054839/shadowroot-getselection)
- `Safari`: 17版本之后Safari提供`Selection.getComposedRanges`，这也是[标准](https://w3c.github.io/selection-api/#dom-selection-getcomposedrange)正在推进的，但是其他浏览器并未跟进（[Can I Use](https://caniuse.com/?search=getComposedRanges)），目前连MDN文档都没有
- `Chromium`: 通过`ShadowRoot.getSelection`可获取正确信息，但这并不是标准API
- `FireFox`：正常通过`Window.getSelection`或`Document.getSelection`即可获取正确信息

:::warning 注
这意味着目前来说Safari17之前都无法使用，17之后或其他浏览器可兼容使用。如果必须在Safari17之前使用该组件，则需要考虑[polyfill](https://github.com/GoogleChromeLabs/shadow-selection-polyfill/issues/11)
:::
## 基本使用

- 通过`triggers`设置触发的字符串，可设置多个，默认为`@`
- 通过`options`配置可选择项，若为数组则为所有`triggers`共用的选项，若为对象则为每个trigger单独配置的选项
- 通过`suffix`设置高亮块的结束字符，默认为空格

<!-- @Code:basicUsage -->

:::warning 注
`triggers`以及`suffix`会被直接用于构造正则表达式，匹配字符串来提取特殊的高亮块，所以注意正则表达式中的特殊字符需要转义
:::

## 不弹选项

当设置`noOptions`后，输入trigger便不会弹出选项，而是自由输入，当遇到suffix或输入回车后变为高亮块

<!-- @Code:freeInput -->
