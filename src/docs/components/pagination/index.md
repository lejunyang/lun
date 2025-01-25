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

## 自定义内容和顺序

通过`controls`属性可自定义分页器的渲染内容和顺序，其为一个数组，值可以为：

- `prev`：上一页按钮
- `pages`：页码列表
- `next`：下一页按钮
- `detail`：显示当前页和总页数的信息
- `sizes`：选择每页显示条数的下拉框
- 其他内容：通过 CustomRenderer 进行渲染

该属性默认值为`['prev', 'pages', 'next']`，下面列出其他值的效果

### 页码信息

在`controls`中加入`'detail'`可以显示页码信息。当没有指定`pageSize`时，只展示当前页码和总页数；当有`pageSize`时，改为展示当前页条数范围和总条数

<!-- @Code:controls -->

### 自定义渲染

`controls`中可以加入其他内容用于自定义渲染，若其为函数，还可以通过参数获取当前分页器的状态

<!-- @Code:custom -->

## 不同大小

<!-- @Code:differentSizes -->
