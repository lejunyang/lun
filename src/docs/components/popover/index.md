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

## 实现方式

通过`type`属性指定 Popover 实现方式, 目前支持以下方式：

- `popover`: 默认值，会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现
- `fixed`: 当前位置渲染，使用 fixed 定位，会受父元素影响
- `teleport`: 将弹出内容渲染到[`teleport-holder`](/components/teleport-holder/)（默认在第一个[`theme-provider`](/components/theme-provider/)下）并使用 fixed 定位，此时主题的继承可能不符合预期，通过`to`属性可调整渲染位置，**此时`pop-content`插槽将无效，必须通过 `content` 属性来指定弹出框渲染内容**

需要注意的是，若浏览器不支持 Popover，手动指定的 `type` 会被无视，将采用备选方案实现

检测到当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

<!-- @Code:otherTypes -->

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
.code-container .circle {
  width: 100px;
  height: 100px;
  border: solid 4px blue;
  border-radius: 50%;
  translate: 0px -50px;
  animation: 1s virtual-element infinite;
  pointer-events: none;
}
@keyframes virtual-element {
  0% { scale: 1; }
  50% { scale: 1.1; }
}

</style>
