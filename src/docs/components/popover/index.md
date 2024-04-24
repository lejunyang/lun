---
title: Popover 弹出
lang: zh-CN
---

`l-popover`作为父元素包裹目标元素，默认渲染子元素，通过`pop-content`插槽或`content`属性设置弹出内容（`content`优先级更高，通过[`CustomRenderer`](/components/custom-renderer/)渲染），通过设定的触发方式来自动展示弹出内容，也可以通过`open`属性或元素上的方法手动控制是否展示

## 基本使用

通过`triggers`属性可设置触发方式，可同时设置多个：

- 悬浮触发`hover`：鼠标移入时触发，鼠标移出后关闭
- 点击触发`click`：点击目标后(pointerdown)触发，点击目标和弹出框以外的地方关闭；若开启点击切换`toggleMode`，则点击目标时切换开启/关闭状态
- 聚焦触发`focus`：目标获得焦点后触发，失去焦点后关闭，当目标或弹出内容存在焦点时，鼠标移出不会关闭
- 编辑触发`edit`：与`focus`相同，但仅在聚焦元素为可编辑元素时才触发，失去焦点后关闭，可编辑元素指`input`, `textarea`, `isContenteditable=true`或存在关联的[`editContext`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/editContext)，存在可编辑聚焦元素时，鼠标移出不会关闭
- 右键触发`contextmenu`：右键时触发，点击其他地方关闭
- 选中触发`select`：选中文本且选中内容与`l-popover`的目标有交集时触发，此时弹框的位置与选中区域有关，失去选中或其他方式触发均会关闭

设置多个值则它们的触发和关闭方式共同生效，默认值为`[hover, click, edit]`

<!-- @Code:basicUsage -->

## 鼠标点击处弹出

对于`click`和`contextmenu`这两种点击触发方式，它们默认以 popover 元素本身的矩形为目标进行定位，如果需要在点击处弹出，则需要设置`pointerTarget`属性为`coord`(默认为`rect`)，这在想要实现菜单时非常有用

<!-- @Code:pointerTarget -->

## 嵌套

<l-popover triggers="hover">
  <l-button>悬浮触发</l-button>
  <l-popover triggers="hover" slot="pop-content">
    <l-button>再次悬浮触发</l-button>
    <l-popover triggers="hover" slot="pop-content">
      <div slot="pop-content">第三次悬浮内容</div>
      <l-button>第三次悬浮触发</l-button>
    </l-popover>
  </l-popover>
</l-popover>

## 弹出位置

<!-- @Code:differentPlacements -->

## 实现方式

通过`strategy`属性指定 Popover 定位方式，可选值为：
- `absolute`：默认值，相对于祖先定位元素进行定位，性能更好，且在页面滚动时表现出色，但祖先为 fixed 时滚动会有一定的视觉延迟。另外，它在某些时候会受到shadow DOM的限制，详细见下面的折叠块说明
- `fixed`：相对于最近 Containing block 进行定位（通常为视口），当 target 也是 fixed 时较为有用，它也可以用于防止被父级裁剪或遮挡，它对 shadow DOM 兼容性更好。但是页面滚动时，重新计算位置会有一定的视觉延迟

:::details 当 strategy=absolute 时 Shadow DOM 对 offsetParent 的限制
strategy=absolute时是通过offsetParent获取祖先元素，但是，被 slotted 的元素无法获取到在里面 shadow 里面的真实 offsetParent，而是会根据其所在自定义元素本身往上寻找 offsetParent。在嵌套 strategy=absolute 时这个限制有可能导致定位错误，但内部对这种情况做了兼容，当`l-popover`为定位元素时优先取其作为内部 offsetParent（**故其默认`position: relative`，请勿修改为 static**）
:::

通过`type`属性指定 Popover 实现方式, 目前支持以下方式：

- `popover`: 默认值，会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现
- `position`: 当前位置渲染
- `teleport`: 将弹出内容渲染到[`teleport-holder`](/components/teleport-holder/)（默认在第一个[`theme-provider`](/components/theme-provider/)下），通过`to`属性可调整渲染位置，**此时`pop-content`插槽将失效，必须通过 `content` 属性来指定弹出框渲染内容**

需要注意的是，若浏览器不支持 Popover，手动指定的 `type` 会被无视，将采用备选方案实现

检测到当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

<!-- @Code:otherTypes -->

## 虚拟元素

通过`target`属性可以指定一个元素或虚拟元素，只需其拥有`getBoundingClientRect`方法，能够返回矩形代表位置即可。`target`优先于默认插槽

<!-- @Code:virtualElement -->

## 单例监听多个目标

`l-popover`支持通过元素上的`attachTarget`方法添加额外的目标，使之可以在多个目标上监听并展示，避免了为每一个元素包裹一个 popover

<!-- @Code:extraTargets -->

## 聚焦时阻止目标切换

当额外监听多个目标时，在某个目标聚焦或编辑时，如果我们想要阻止 popover 因为非聚焦的方式（例如鼠标移入）切换到其他的目标，我们可以使用`preventSwitchWhen`属性，可选值有：

- `focus`：聚焦时阻止切换目标
- `edit`：编辑时阻止切换目标

<!-- @Code:preventSwitch -->

## 关闭时停止更新

一般来说不会在关闭 popover 的时候更新内容，如果很难避免这种情况（例如在表单里面，字段失焦时触发校验，校验失败的信息在 popover 关闭时就更新上去了，造成闪烁），可以使用`freezeWhenClosing`属性。当开启时，如果 popover 正在关闭，停止`content`属性的更新（`pop-content`插槽不受影响）

<!-- @Code:freezeUpdate -->

## 不同大小

<!-- @Code:differentSizes -->

<script setup>
  import { supportPopover } from '@lun/utils';
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
