---
title: ScrollView 滚动视图
lang: zh-CN
---

该组件用于充当滚动容器，通过对滚动状态的监听来动态渲染某些元素并添加动画，也支持模拟滚动驱动动画

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

通过CSS变量`--scroll-x-progress`和`--scroll-y-progress`即可获取当前滚动进度（小数0~1），以此设置样式便可模拟滚动驱动动画。

通过`scrollXPercentVarName`和`scrollYPercentVarName`可以自定义这两个CSS变量名

当浏览器支持[registerProperty](https://developer.mozilla.org/en-US/docs/Web/API/CSS/registerProperty_static)时会自动将它们注册为数值自定义变量，以便使用

<!-- @Code:scrollDrivenAnimation -->

## 模拟滚动视图驱动动画

通过`observeView`属性可以开启滚动视图监听，其可以指定一个或多个子元素为监听目标，当目标视图在`l-scroll-view`滚动进度发生变化时会更新对应CSS变量或触发回调，以此便可实现对应动画效果

<!-- @Code:viewScrollDriven -->

**该特性等有空再来补充完整，有些边界情况还没有弄清**。使用原生实现如下：

<Test />

## 综合滚动动画示例

<!-- @Code:demo -->

<script setup>
  import Test from './_devViewScroll.vue';
</script>