## 基础使用

<l-popover triggers="hover">
  <div slot="content" style="top: 180px; left: 500px; position: fixed">悬浮触发弹出</div>
  <l-button>悬浮触发</l-button>
</l-popover>

<l-popover triggers="click">
  <div slot="content" style="top: 200px; left: 500px; position: fixed">点击触发弹出</div>
  <l-button>点击触发</l-button>
</l-popover>

<l-popover triggers="focus">
  <div slot="content" style="top: 200px; left: 500px; position: fixed">聚焦触发弹出</div>
  <l-button>聚焦触发</l-button>
</l-popover>

<l-popover triggers="contextmenu">
  <div slot="content" style="top: 200px; left: 500px; position: fixed">右键触发弹出</div>
  <l-button>右键触发</l-button>
</l-popover>

<l-popover :triggers="['hover', 'click', 'focus', 'contextmenu']">
  <div slot="content" style="top: 200px; left: 500px; position: fixed">弹出</div>
  <l-button>所有触发方式</l-button>
</l-popover>

## 嵌套

<l-popover triggers="hover">
  <div slot="content" style="top: 300px; left: 500px; position: fixed">
    <l-popover triggers="hover">
      <div slot="content" style="top: 320px; left: 480px; position: fixed">第二层</div>
      <l-button>再次悬浮触发</l-button>
    </l-popover>
  </div>
  <l-button>悬浮触发</l-button>
</l-popover>
