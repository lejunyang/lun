---
title: ScrollView 滚动视图
lang: zh-CN
---

:::warning 注
Highly experimental
:::

## 基本使用

组件内部维护了一些滚动相关的状态，通过`getSlots`便可使用这些状态动态渲染插槽，决定插槽是否展示以及切换展示时的动画效果

```ts
export type ScrollViewState = {
  width: number;
  height: number;
  /** x轴滚动距离 */
  scrollX: number;
  scrollY: number;
  scrolling: boolean;
  /** x轴是否溢出 */
  xOverflow: boolean;
  yOverflow: boolean;
  /** 是否在x轴向前滚动了 */
  xForward: boolean;
  /** 是否在x轴向后滚动了 */
  xBackward: boolean;
  yForward: boolean;
  yBackward: boolean;
};
```

<!-- @Code:scrollState -->

## 模拟滚动进度驱动动画

通过CSS变量`--scroll-x-percent`和`--scroll-y-percent`即可获取当前滚动进度（小数），以此设置样式便可模拟滚动驱动动画。

通过`scrollXPercentVarName`和`scrollYPercentVarName`可以自定义这两个CSS变量名

当浏览器支持[registerProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSS/registerProperty_static)时会自动将它们注册为数值自定义变量，以便使用

<!-- @Code:scrollDrivenAnimation -->

## 模拟滚动视图驱动动画

<!-- @Code:viewScrollDriven -->