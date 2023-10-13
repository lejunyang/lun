## 基础使用

<l-popover triggers="hover">
  <div slot="pop-content">悬浮触发弹出</div>
  <l-button>悬浮触发</l-button>
</l-popover>

<l-popover triggers="click">
  <div slot="pop-content">点击触发弹出</div>
  <l-button>点击触发</l-button>
</l-popover>

<l-popover triggers="focus">
  <div slot="pop-content">聚焦触发弹出</div>
  <l-button>聚焦触发</l-button>
</l-popover>

<l-popover triggers="contextmenu">
  <div slot="pop-content" >右键触发弹出</div>
  <l-button>右键触发</l-button>
</l-popover>

<l-popover :triggers="['hover', 'click', 'focus', 'contextmenu']">
  <div slot="pop-content" >弹出</div>
  <l-button>所有触发方式</l-button>
</l-popover>

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

## dialog 实现

默认情况下会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现，若浏览器不支持，则会转为使用原生 [`dialog`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog) 来实现，若均不支持，则会改为使用定位

当然，也可以通过`type`属性取指定实现方式。需要注意的是，若浏览器不支持，手动指定的 `type` 会被无视，将采用备选方案实现

<l-popover type="dialog">
  <div slot="pop-content" >由原生dialog实现</div>
  <l-button>悬浮触发</l-button>
</l-popover>