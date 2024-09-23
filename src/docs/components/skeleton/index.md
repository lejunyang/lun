---
title: Skeleton 骨架屏
lang: zh-CN
---

## 基本使用

- 需要通过样式自行设置大小，或者用子元素撑开
- 设置`loading`以进入加载状态，否则直接显示子元素，`loading`可以被继承，详见[编辑属性](/guides/inherit/#编辑状态继承)

<!-- @Code:basicUsage -->

## 动态切换

骨架屏切换的过渡效果可由`loadTransition`设置，默认为`fade`

<!-- @Code:toggle -->
