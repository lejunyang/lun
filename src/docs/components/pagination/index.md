---
title: Pagination 分页
lang: zh-CN
---

<CompThemePanel comp="pagination" includeContrast includeDisabled :other="{ pages: 3, current: 2 }" />

## 基本使用

有两种方式可以设置分页器的总页数：

1. 通过`pages`属性直接设置
2. 设置`pageSize`和`total`，总页数将为`Math.ceil(total / pageSize)`，若其有效则优先生效

<!-- @Code:basicUsage -->

## 页数省略

当页数较多时分页器会自动显示省略号，点击省略号会快速前进/后退 n 页，其值由`dotsJump`属性控制，默认为 5

省略号周围显示多少页数由`siblings`和`boundaries`控制，具体见下

<!-- @Code:dots -->

## 不同大小

<!-- @Code:differentSizes -->