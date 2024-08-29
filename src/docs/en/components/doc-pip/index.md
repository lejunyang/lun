---
title: DocPip 画中画
lang: zh-CN
---

[Document Picture in Picture](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)，即文档画中画，用于将某些内容用小窗的形式展现给用户，即使用户在不同的页面之间切换，小窗依然能置顶展示。以往画中画仅支持视频元素，而文档画中画允许任意元素

- `l-doc-pip`作为容器默认会显示它的 children，当请求画中画成功后，会将其 children 全部移入画中画，关闭后又移动回原位置
- 该特性只能在安全上下文(https 或 localhost)下使用，且目前仅 Chromium >=116 支持，检测到**当前浏览器{{ supportDocumentPictureInPicture ? '支持该特性' : '不支持该特性，以下示例均无法工作' }}**

## 基本使用

通过调用元素的`openPip`方法来请求打开画中画，也可以通过`open`属性来控制打开与否（不建议一开始设为 true，在页面没有交互的情况下，浏览器禁止打开画中画）

节点在原文档和画中画文档之间移动会保持状态，而且，在原文档中通过 Vue 或 React 更新子节点的状态，画中画文档中的节点也会正常更新（必须是针对同一节点的更新，不可以删除再重新创建（例如更新 key））

<!-- @Code:basicUsage -->

:::info 注
调用`openPip`方法在不同情况下的返回值不一样：

- `Promise<undefined>`： 不支持文档画中画，元素未加载或元素已卸载
- `Promise<false>`：不存在子元素，有另一个`openPip`未完成或当前元素已打开画中画
- `Promise<true>`：成功打开
- 抛出异常：请求打开画中画失败，可能由于浏览器禁用、处于非安全环境下、处于非顶层 window、用户未与页面进行交互、width 或 height 非法等等
  :::

## 样式复制与包裹主题

画中画文档是一个全新的文档，除非子节点自带内联样式，否则我们需要复制原文档中的样式以使其在画中画里面样式一致，可通过以下方式：

- `copyDocStyleSheets`属性：默认为 true，会将 document.styleSheets 中所有 _有 ownerNode 的样式_ 复制到画中画 document，例如 link 节点，style 节点。画中画文档中，由于是直接复制节点，link 节点有可能因为网络原因加载失败
- `pipStyles`属性：用于手动设置画中画中的样式，可以为样式字符串、`CSSStyleSheet`或`HTMLStyleElement`，或者包含它们的数组均可以，会将这些样式复制到画中画文档
- `openPip(...extraStyles)`方法：其 extraStyles 参数同`pipStyles`属性，用于在手动调用方法时额外设置样式

:::tip 注
Custom Element在不同 document 之间移动时，其`adoptedStyleSheets`会被清除，这是因为`CSSStyleSheet`不可以在不同的文档间共享。本组件在移动前后会遍历所有节点，找到带有 shadowRoot 的节点，帮助它们复制或恢复`adoptedStyleSheets`，以保证样式不丢失
:::

由于本组件库的组件依赖于`l-theme-provider`提供的样式，因此如果需要展示的元素中包含它们，画中画文档中也必须包含`l-theme-provider`节点以及它的样式，我们可以通过：

- `wrapThemeProvider`属性：默认为 true，复制节点到画中画文档时会创建一个`l-theme-provider`并包裹它们，同时复制`l-doc-pip`所在位置的 theme context config 和 edit state
- 自行为子节点包裹`l-theme-provider`节点

<!-- @Code:copyStyles -->

## 自定义宽高

通过`width`和`height`属性可自定义画中画窗口的宽度和高度，它们均为像素长度，必须同时指定或都不指定，否则浏览器会抛出异常。另外，如果指定的数值较大，浏览器可能会忽视

这两个属性均为[响应式断点属性](/components/theme-provider/)，即它们也可以设置为如下的对象

```ts
{
  initial?: number
  xs?: number,
  sm?: number,
  md?: number,
  lg?: number,
  xl?: number,
}
```

<!-- @Code:differentSize -->

<script setup>
import { supportDocumentPictureInPicture } from '@lun/utils';
</script>

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->