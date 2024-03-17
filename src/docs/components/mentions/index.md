---
title: Mentions 提及
lang: zh-CN
---

该组件基于`contenteditable`实现，但是目前`Selection in Shadow DOM`有问题，各浏览器各不相同，参考[这个](https://stackoverflow.com/questions/62054839/shadowroot-getselection)
- `Safari`: 17版本之后Safari提供`Selection.getComposedRanges`，这也是[标准](https://w3c.github.io/selection-api/#dom-selection-getcomposedrange)正在推进的，但是其他浏览器并未跟进（[Can I Use](https://caniuse.com/?search=getComposedRanges)），目前连MDN文档都没有
- `Chromium`: 通过`ShadowRoot.getSelection`可获取正确信息，但这并不是标准API
- `FireFox`：正常通过`Window.getSelection`或`Document.getSelection`即可获取正确信息

## 基本使用

<!-- @Code:basicUsage -->
