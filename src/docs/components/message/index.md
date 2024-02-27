---
title: Message 消息
lang: zh-CN
---

- `Message`元素是一个消息容器，你需要自行将其渲染到某个地方，并通过该元素的方法来创建或关闭消息
- `Message`的属性会作为公共属性，在打开消息时与传入的设置合并

## 基本使用

<!-- @Code:basicUsage -->

## 不同位置

<!-- @Code:differentPlacements -->

## 静态方法

`Message`有静态方法`open`，方便在js中直接创建并展示消息，其相当于创建一个Message元素并添加到页面中，创建后会保持复用

<!-- @Code:staticMethods -->