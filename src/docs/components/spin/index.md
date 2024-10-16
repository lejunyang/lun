---
title: Spin 加载中
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

:::info 注
Spin 会继承主题中的 size 和 color，同时也可以通过`svgStyle`属性设置 font-size 和 color 来设置 Spin 的大小和颜色，其优先级更高
:::

## 延迟展示

设置`delay`即可延迟展示 spin，通常用于在手动控制 spinning 时，延迟展示以防止持续时间过短而造成的闪烁

<!-- @Code:delay -->

## 作为容器

正常情况 Spin 不接收子节点，当添加`asContainer`属性后便可以作为容器组件，使图标显示在容器中央，此时也会接受`tip`属性或插槽

<!-- @Code:asContainer -->

<style lang="scss">
@keyframes bounce {
  12.5% {
    transform: translateY(-0.5em);
  }
  25% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(0);
  }
}

.spin-loading-tip span {
  display: inline-block;
  animation: bounce 1.5s 0s ease infinite;
  &:nth-child(2) {
    animation-delay: 0.5s;
  }
  &:nth-child(3) {
    animation-delay: 1s;
  }
}
</style>
