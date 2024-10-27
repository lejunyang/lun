---
title: Message 消息
lang: zh-CN
---

## 基本使用

- `l-message`元素是一个消息容器，你需要自行将其渲染到某个地方，并通过该元素的方法来创建或关闭消息。每一条消息为一个`Callout`，其支持`Callout`的所有属性，因此`message`和`description`均支持[自定义渲染](/components/custom-renderer/)

```ts
type MessageExpose = {
  open(config?: MessageOpenConfig): void;
  close(key: string | number): void;
  closeAll(): void;
};

type MessageOpenConfig = {
  key?: string | number;
  type?: Status;
  duration?: number | string;
  resetDurationOnHover?: boolean;
} & CalloutProps &
  MessageEvents &
  HTMLAttributes;
```

- `l-message`本身的属性会作为公共属性，在打开消息时与传入的设置合并。

<!-- @Code:basicUsage -->

## 不同位置

<!-- @Code:differentPlacements -->

## 静态方法

`Message`有静态方法`open`，方便在 js 中直接创建并展示消息，其相当于创建一个`l-message`元素并添加到页面中，创建后会保持复用

另有四个静态方法`success`, `error`, `warning`, `info`，它们用于创建指定类型的消息（相当于 open 方法 指定 type），同时它们可以直接传递字符串，更方便调用

<!-- @Code:staticMethods -->

## 实现方式

通过`type`属性指定 Message 实现方式, 目前支持以下方式：

- `popover`: 默认值，会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现
- `normal`: 当前位置渲染，使用 fixed 定位，会受父元素影响
- `teleport`: 将弹出内容渲染到[`teleport-holder`](/components/teleport-holder/)（默认在第一个[`theme-provider`](/components/theme-provider/)下）并使用 fixed 定位，此时主题的继承可能不符合预期，通过`to`属性可调整渲染位置

需要注意的是，若浏览器不支持 Popover，手动指定的 `type` 会被无视，将采用备选方案实现

检测到当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

<!-- @Code:otherTypes -->

## 自动关闭

通过 `duration` 属性可以让消息在指定时间后自动关闭，单位为毫秒，不指定（`undefined`）则默认为 3000（3 秒），若为`null`或字符串`none`，则不会自动关闭，小于等于 0 或其他非法值会使其打开后立即关闭

`resetDurationOnHover` 属性可以使得鼠标移入时移除计时器，移出后重新计时，默认为 `true`

<!-- @Code:duration -->

<script setup>
  import { supportPopover } from '@lun-web/utils';
</script>

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->