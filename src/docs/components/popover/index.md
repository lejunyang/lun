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

通过`strategy`属性指定 Popover 定位方式，可选值为`absolute`和`fixed`

通过`type`属性指定 Popover 实现方式, 目前支持以下方式：

- `popover`: 默认值，会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现
- `position`: 当前位置渲染
- `teleport`: 将弹出内容渲染到[`teleport-holder`](/components/teleport-holder/)（默认在第一个[`theme-provider`](/components/theme-provider/)下），此时主题的继承可能不符合预期，通过`to`属性可调整渲染位置，**此时建议通过 `content` 属性来指定弹出框渲染内容，而不是通过`pop-content`插槽**，内部对插槽做了兼容，但消耗非常大

需要注意的是，若浏览器不支持 Popover，手动指定的 `type` 会被无视，将采用备选方案实现

检测到当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

:::warning 严格注意 type 和 strategy 的组合

- `strategy=absolute`：相对于祖先定位元素进行定位，性能更好，且在页面滚动时表现出色。但是由于 shadow DOM 的限制，被 slotted 的元素通过 offsetParent 无法获取到在里面 shadow 里面的真实 offsetParent，而是会根据其所在自定义元素本身往上寻找 offsetParent，这会导致定位错误。由于内部 popover target 默认取的就是`l-popover`元素本身，所以**l-popover 没有被其他自定义元素 slotted 时，absolute 可以正常工作**。
  另外，top layer 下会直接以 window 计算定位，所以**当使用`type=popover`可以正常使用 absolute**
- `strategy=fixed`：相对于最近块级祖先进行定位（通常为视口），当 target 为 fixed 时较为有用，它也可以用于防止被父级 overflow: hidden，最为重要的是，它对 shadow DOM 兼容性最好。但是页面滚动时，重新计算位置会有一定的视觉延迟

因此，内部对于 strategy 的取值逻辑为：

- 若外部指定了有效 strategy，则取外部
- 若`l-popover`没有 assignedNode，或者支持 Top Layer Popover 且 type=popover，则取 absolute
- 否则取 fixed

:::

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
