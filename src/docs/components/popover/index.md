---
title: Popover 弹出
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## 嵌套

<l-popover triggers="hover" content="first">
  <l-button>悬浮触发</l-button>
  <l-popover triggers="hover" slot="pop-content" content="second">
    <l-button>再次悬浮触发</l-button>
    <l-popover triggers="hover" slot="pop-content" content="third">
      <div slot="pop-content">第三次悬浮内容</div>
      <l-button>第三次悬浮触发</l-button>
    </l-popover>
  </l-popover>
</l-popover>

## 弹出内容聚焦时不会隐藏

<l-popover>
  <div slot="pop-content">
    <l-input value="value" />
    test
  </div>
  <l-button>悬浮触发</l-button>
</l-popover>

## 弹出位置

<!-- @Code:differentPlacements -->

## fixed 实现

默认情况下会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现，若浏览器不支持，则会改为使用 fixed 定位

检测到当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

当然，也可以通过`type`属性指定实现方式(`popover`, `teleport`, `fixed`)。需要注意的是，若浏览器不支持，手动指定的 `type` 会被无视，将采用备选方案实现

<l-popover type="fixed">
  <div slot="pop-content">由fixed实现</div>
  <l-button>悬浮触发</l-button>
</l-popover>

## 虚拟元素

<!-- @Code:virtualElement -->

## 不同大小

<!-- @Code:differentSizes -->

<script setup>
  import { isSupportPopover } from '@lun/utils';
  const supportPopover = isSupportPopover();
</script>

<style>
.popover-virtual::part(pop-content) {
  background-color: transparent;
  z-index: 999;
  pointer-events: none;
}
.circle {
  width: 100px;
  height: 100px;
  border: solid 4px blue;
  border-radius: 50%;
  translate: 0px -50px;
  animation: 1s virtual-element infinite;
}
@keyframes virtual-element {
  0% { scale: 1; }
  50% { scale: 1.1; }
}

</style>
