---
title: Text 文本
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## 单行超出隐藏

添加`ellipsis`属性即可使元素在限定宽度的容器中隐藏超出的内容，并显示省略号。省略号的位置默认为文档方向结束位置，可以设置`left`, `right`, `middle`来指定位置。

:::warning 注
指定ellipsis位置是靠特定的direction（ltr和rtl）实现，这可能并不是一个很好的做法，谨慎使用，尤其是对于`ellipsis=middle`，其after伪元素使用了rtl，可以看到文本截断的位置不是很准确，而且段落最后的句号没有了，在rtl环境下还需要手动指定为ltr
:::

<!-- @Code:ellipsis -->
