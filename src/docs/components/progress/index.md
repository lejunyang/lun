---
title: Progress 进度
lang: zh-CN
---

## 直线

<!-- @Code:line -->

## 页面加载进度

`Progress`拥有静态方法`createPageTopProgress`，其会往页面顶部添加一个永不结束的进度条，直到手动关闭。

<!-- @Code:pageTop -->

## 波浪

<!-- @Code:wave -->

:::warning 注
波浪的面积并非跟随value的值线性变化，在value接近0或接近100时尤为如此，较小的value变化可能不是很明显
:::