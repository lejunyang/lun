---
title: Popover 弹出
lang: zh-CN
---

`l-popover`作为父元素包裹目标元素，默认渲染子元素，通过`pop-content`插槽或`content`属性设置弹出内容（`content`优先级更高，通过[`CustomRenderer`](/components/custom-renderer/)渲染），通过设定的触发方式来自动展示弹出内容，也可以通过`open`属性或元素上的方法手动控制是否展示

## 基本使用

通过`triggers`属性可设置弹出框触发方式，可同时设置多个：

- 悬浮触发`hover`：鼠标移入时触发，鼠标移出后关闭
- 点击触发`click`：点击目标时(pointerdown)触发，点击除目标和弹出框以外的地方关闭；若开启点击切换`toggleMode`，则点击目标时切换开启/关闭状态
- 按住触发`pointerdown`：按住目标时触发，松开后关闭
- 聚焦触发`focus`：目标获得焦点后触发，失去焦点后关闭，当目标或弹出内容存在焦点时，鼠标移出不会关闭
- 编辑触发`edit`：与`focus`相同，但仅在聚焦元素为可编辑元素时才触发，失去焦点后关闭，可编辑元素指`input`, `textarea`, `isContenteditable=true`或存在关联的[`editContext`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/editContext)，存在可编辑聚焦元素时，鼠标移出不会关闭
- 右键触发`contextmenu`：右键时触发，点击其他地方关闭
- 选中触发`select`：选中文本且选中内容与`l-popover`的目标有交集时触发，此时弹框的位置与选中区域有关，失去选中或其他方式触发均会关闭

设置多个值则它们的触发和关闭方式**共同生效**，默认值为`[hover, click, edit]`

<!-- @Code:basicUsage -->

## 鼠标点击处弹出

对于`click`和`contextmenu`这两种点击触发方式，它们默认以 popover 元素本身的矩形为目标进行定位，如果需要在点击处弹出，则需要设置`pointerTarget`属性为`coord`(默认为`rect`)，这在想要实现菜单之类的功能时非常有用

<!-- @Code:pointerTarget -->

## 单例监听多个目标

组件支持为其不同的子元素单独触发并显示不同的内容，从而避免包裹多个`l-popover`元素。

该功能是通过属性自动添加监听的子元素，通过`autoAttachAttr`指定一个属性名，然后为目标子元素设置这个你指定的属性名（例如以下示例的`data-target`），属性的值为插槽名，这个子元素对应的弹出内容也添加对应的`slot`即可

需要注意的是，自动监听的子元素必须为`l-popover`的直接子元素，不可以是深层的节点。你也不可以动态设置属性来添加或删除，必须触发默认插槽的变更才行

该功能也支持命令式调用，命令式调用不受上面的限制，而且还能添加`l-popover`以外的元素，详见[命令式监听多个目标](#命令式监听多个目标)

<!-- @Code:autoAttach -->

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

- `absolute`：默认值，相对于祖先定位元素进行定位，性能更好，且在页面滚动时表现出色，但祖先为 fixed 时滚动会有一定的视觉延迟。另外，它在某些时候会受到 shadow DOM 的限制，详细见下面的折叠块说明
- `fixed`：相对于最近 Fixed Containing block 进行定位（通常为视口），当 target 也是 fixed 时较为有用，它也可以用于防止被父级裁剪或遮挡，它对 shadow DOM 兼容性更好。但是某些情况下页面滚动时，由于 transition 的存在，位置的变动会导致一定的视觉延迟

:::details 当 strategy=absolute 时 Shadow DOM 对 offsetParent 的限制
strategy=absolute 时是通过 offsetParent 获取祖先元素，但是，被 slotted 的元素无法获取到在里面 shadow 里面的真实 offsetParent，而是会根据其所在自定义元素本身往上寻找 offsetParent。在嵌套 strategy=absolute 时这个限制有可能导致定位错误，但内部对这种情况做了兼容，当`l-popover`为定位元素时优先取其作为内部 offsetParent（**故其默认`position: relative`，请勿修改为 static**）
:::

通过`type`属性指定 Popover 实现方式, 目前支持以下方式：

- `popover`: 默认值，会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现
- `normal`: 当前位置渲染，会受包含块的影响
- `teleport`: 将弹出内容渲染到[`teleport-holder`](/components/teleport-holder/)（默认在第一个[`theme-provider`](/components/theme-provider/)下），通过`to`属性可调整渲染位置，**此时`pop-content`插槽将失效，必须通过 `content` 属性来指定弹出框渲染内容**

需要注意的是，若浏览器不支持 Popover，手动指定的 `type` 会被无视，将采用备选方案实现

<Support is="popover" /> 当前浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

<!-- @Code:otherTypes -->

## CSS Anchor positioning

<Support is="anchorPosition" /> 当前浏览器{{ supportCSSAnchor ? '' : '不' }}支持 CSS Anchor positioning

CSS Anchor positioning 是一个非常强大的新特性，利用它我们可以让浏览器自行将悬浮元素定位到某个元素，避免我们手动计算和更新位置，带来更好的体验和性能，详细介绍可参考[Chrome 文档](https://developer.chrome.com/blog/anchor-positioning-api?hl=zh-cn)或[MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning)

本组件支持该特性，只需设置`anchorName`属性给定任意CSS合法名称（不需要以`--`开头），即可在浏览器支持的情况下开启 CSS Anchor Positioning，此时`strategy=absolute`和`strategy=fixed`将不会有明显区别，均有较佳的体验

:::warning 注
由于该特性对 Shadow DOM 有限制，声明 anchor 定位与 anchor-name 的 CSS 必须在同一个 Shadow Tree 下，否则不会生效，详细请参考[标准](https://drafts.csswg.org/css-anchor-position-1/#target)。因此，该特性在以下情况**不会开启**：

- **type=teleport**：此时悬浮元素在 teleport-holder 下，如果此时想要使用该特性必须由用户在 document 下利用`::part()`选择器自行声明 Anchor positioning 相关样式
- **target 为虚拟元素或外部元素**：如 triggers="select"时选中的文本，通过属性手动指定的 target， attachTarget 添加的目标

也许未来标准会有进一步的改进，可关注该[issue](https://github.com/w3c/csswg-drafts/issues/9408)
:::

<!-- @Code:anchorPosition -->

## 自动翻转、偏移

通过`flip`属性可开启自动翻转，`shift`可开启自动偏移，用于在悬浮层超出容器时自动调整位置。它们都是`floating-ui`插件，支持它们各自的参数，不传则为默认参数，具体请参考[文档](https://floating-ui.com/docs/flip)

:::warning 注
由于这是`floating-ui`插件，使用 CSS Anchor positioning 时是不生效的。这种情况下可通过`popStyle`等方式自行设置[`position-try-fallbacks`](https://developer.mozilla.org/en-US/docs/Web/CSS/position-try-fallbacks)（Chromium128 之前为`position-try-options`）来让浏览器自行调整，但这种方式会使得箭头定位异常，需要取舍，或许可以等一手[issue1](https://github.com/w3c/csswg-drafts/issues/9271)、[issue2](https://github.com/w3c/csswg-drafts/issues/8171)
:::

<!-- @Code:plugins -->

## 虚拟元素

通过`target`属性可以指定一个元素或虚拟元素，只需其拥有`getBoundingClientRect`方法，能够返回矩形代表位置即可。`target`优先于默认插槽

<!-- @Code:virtualElement -->

## 命令式监听多个目标

`l-popover`支持通过元素上的`attachTarget`方法添加额外的目标，使之可以在多个目标上监听并展示，避免了要为每一个元素包裹一个 popover

`attachTarget`第二个参数可以指定`slotName`，当目标元素激活popover时会切换为该插槽展示，而不是默认的`pop-content`插槽，以此便可以根据目标元素动态设置弹出内容。如果是通过`content`属性设置弹出内容，则可以使用函数，从参数中可以获取当前激活的目标元素以动态渲染内容

<!-- @Code:extraTargets -->

## 聚焦时阻止目标切换

当使用单例监听多个目标时，在某个目标聚焦或编辑时，如果我们想要阻止popover因为非聚焦的方式（例如鼠标移入）切换到其他的目标，则可以使用`preventSwitchWhen`属性，可选值有：

- `focus`：聚焦时阻止切换目标
- `edit`：编辑时阻止切换目标

<!-- @Code:preventSwitch -->

## 关闭时停止更新

一般来说不会在关闭 popover 的时候更新内容，如果很难避免这种情况（例如在表单里面，字段失焦时触发校验，校验失败的信息在 popover 关闭时就更新上去了，造成闪烁），可以使用`freezeWhenClosing`属性。当开启时，如果 popover 正在关闭，停止`content`属性的更新（注意如果是使用`pop-content`插槽则无法影响）

<!-- @Code:freezeUpdate -->

## 同步宽度高度

弹出内容可通过`popWidth`和`popHeight`属性指定宽度和高度，它可以为任意 CSS 长度值，为数字时会视为像素值。它们还支持两个特殊的值`anchorWidth`和`anchorHeight`，当为这两个值时，弹出框的宽度和高度会和锚点元素保持一致

<!-- @Code:syncSize -->

## 不同大小

<!-- @Code:differentSizes -->

<script setup>
  import { supportPopover, supportCSSAnchor } from '@lun-web/utils';
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
