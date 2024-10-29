---
title: Mentions 提及
lang: zh-CN
---

:::warning 注
experimental
:::

该组件用于文本域中需要动态显示高亮块的场景，比如@提及某人、#提及话题等。

该组件基于`contenteditable`以及`Selection`实现，但是目前`Selection in Shadow DOM`有问题，各浏览器实现各不相同，参考[这个](https://stackoverflow.com/questions/62054839/shadowroot-getselection)

- `Safari`: 通过`Window.getSelection`无法获取Shadow DOM内的节点。17 版本之后 Safari 提供[`Selection.getComposedRanges`](https://developer.mozilla.org/en-US/docs/Web/API/Selection/getComposedRanges)，这也是[标准](https://w3c.github.io/selection-api/#dom-selection-getcomposedrange)正在推进的，但是兼容性堪忧（[Can I Use](https://caniuse.com/?search=getComposedRanges)）
- `Chromium`: 通过`ShadowRoot.getSelection`可获取正确信息，但这并不是标准 API
- `FireFox`：正常通过`Window.getSelection`或`Document.getSelection`即可获取正确信息(128 Nightly 版本之后也支持 getComposedRanges)

:::warning 注
这意味着目前来说 Safari17 之前都无法使用，17 之后或其他浏览器可兼容使用。如果必须在 Safari17 之前使用该组件，则需要考虑[polyfill](https://github.com/GoogleChromeLabs/shadow-selection-polyfill/issues/11)
:::

## 基本使用

- 通过`triggers`设置触发的字符串，可设置多个，默认为`@`
- 通过`options`配置可选择项，若为数组则为所有`triggers`共用的选项，若为对象则为每个 trigger 单独配置的选项
- 通过`suffix`设置高亮块的结束字符，默认为空格

<!-- @Code:basicUsage -->

:::warning 注
`triggers`以及`suffix`会被直接用于构造正则表达式，匹配字符串来提取特殊的高亮块，所以注意正则表达式中的特殊字符需要转义
:::

## 不弹选项

当设置`noOptions`后，输入 trigger 便不会弹出选项，而是自由输入，当遇到 suffix 或输入回车后变为高亮块

<!-- @Code:freeInput -->

## 自定义渲染

通过`mentionRenderer`即可自定义渲染高亮块，返回的值由[`custom-renderer`](/components/custom-renderer/)进行渲染

<!-- @Code:customRenderer -->

## 高亮触发内容

通过`triggerHighlight`属性设置高亮块的名称，当你的浏览器支持[CSS Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)时，则会启用 trigger 内容高亮（即输入@之后，高亮它后面的内容），可参考下面的示例

检测到当前浏览器{{ supportCSSHighLight ? '支持' : '不支持' }} CSS Highlight API

值得注意的是，CSS highlight 可以穿透 Shadow DOM，所以不一定需要将样式定义在组件内部，在外面也是可以的。高亮样式注意仅支持部分 CSS 属性，可参考[::highlight](https://developer.mozilla.org/en-US/docs/Web/CSS/::highlight)

<!-- @Code:highlight -->

<script setup>
import { supportCSSHighLight } from '@lun-web/utils';
</script>
