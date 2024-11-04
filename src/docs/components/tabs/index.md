---
title: Tabs 标签组
lang: zh-CN
---

<CompThemePanel comp="tabs" :other="{ noPanel: true, items: [{label: 'Tab 1'}, {label: 'Tab 2'}] }" />

## 基本使用

有两种方式设置标签项：
- `items` 属性：传入一个数组，数组的每一项代表一个标签项
- `l-tab-item`: 自行在`l-tabs`下渲染，这种方式必须设置`slot`属性

这两种方式不可共存，第一种优先级更高
<!-- @Code:basicUsage -->

## 垂直

<!-- @Code:vertical -->

## 不同变种

<!-- @Code:variants -->
