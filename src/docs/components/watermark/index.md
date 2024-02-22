---
title: Watermark 水印
lang: zh-CN
---

- watermark 元素的 style 不可被更改，会自动恢复
- 为防止内容被修改，watermark 的属性仅支持设置一次，当某个属性为真值或 0 之后，其不会再被更新。目前其大部分属性都有在全局配置中设置默认值，意味着它们在元素加载后就不可更改了
- watermark 元素无法被移除，会自动添加回原来的位置，除非移除其父元素
- watermark 的 shadowRoot 为 closed，外界无法直接通过属性访问，其内节点无法被移除，会自动添加回去，其内元素的 style 无法被修改，也会自动恢复

## 基本使用

<!-- @Code:basicUsage -->

## 多行水印

<!-- @Code:multipleLines -->

## 图片水印

`image`优先级更高，会优先展示。为防止图片加载失败，可以同时设置`image`和`content`属性，图片加载失败后会展示`content`

<!-- @Code:withImage -->

:::info 注
`image`可以设置为`none`，与不设置的效果相同，但它可以防止那些只设了`content`的水印被修改。目前`image`的默认值即为`none`，所以它不可以被延迟更改，如果有延迟更改的需求可考虑修改全局配置的默认属性
:::
