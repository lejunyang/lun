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

## 弹出位置

<div style="text-align: center">
  <l-popover content="content" placement="top-start">
    <l-button>TL</l-button>
  </l-popover>
  <l-popover content="content" placement="top">
    <l-button>Top</l-button>
  </l-popover>
  <l-popover content="content" placement="top-end">
    <l-button>TR</l-button>
  </l-popover>
</div>
<div style="float: left; display: flex; flex-direction: column;">
  <l-popover content="content" placement="left-top">
    <l-button>LT</l-button>
  </l-popover>
  <l-popover content="content" placement="left">
    <l-button>Left</l-button>
  </l-popover>
  <l-popover content="content" placement="left-end">
    <l-button>LB</l-button>
  </l-popover>
</div>
<div style="float: right; display: flex; flex-direction: column">
  <l-popover content="content" placement="right-start">
    <l-button>RT</l-button>
  </l-popover>
  <l-popover content="content" placement="right">
    <l-button>Right</l-button>
  </l-popover>
  <l-popover content="content" placement="right-end">
    <l-button>RB</l-button>
  </l-popover>
</div>
<div style="clear: both; text-align: center; gap: 5px">
  <l-popover content="content" placement="bottom-start">
    <l-button>BL</l-button>
  </l-popover>
  <l-popover content="content" placement="bottom">
    <l-button>Bottom</l-button>
  </l-popover>
  <l-popover content="content" placement="bottom-end">
    <l-button>BR</l-button>
  </l-popover>
</div>

## fixed 实现

默认情况下会使用原生 [`Popover API`](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API) 去实现，若浏览器不支持，则会改为使用 fixed 定位

检测到浏览器{{ supportPopover ? '' : '不' }}支持 Popover API

当然，也可以通过`type`属性指定实现方式(`popover`, `teleport`, `fixed`)。需要注意的是，若浏览器不支持，手动指定的 `type` 会被无视，将采用备选方案实现

<l-popover type="fixed">
  <div slot="pop-content">由fixed实现</div>
  <l-button>悬浮触发</l-button>
</l-popover>

## 虚拟元素

<l-checkbox :checked="isOn" @update="isOn = $event.detail.checked">{{ isOn ? '关闭' : '开启'}}</l-checkbox>
<l-popover class="popover-virtual" ref="virtualPop" :target="virtualEl" :show="isOn" >
  <div slot="pop-content" class="circle"></div>
</l-popover>

<script setup>
  import { isSupportPopover, throttle } from '@lun/utils';
  import { ref, reactive, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue';
  const supportPopover = isSupportPopover();
  const mouseState = reactive({
    x: 0,
    y: 0,
  })
  const virtualPop = ref();
  const isOn = ref(false);
  const virtualEl = computed(() => {
    if(mouseState.x || mouseState.y) {
    }
    return {
      getBoundingClientRect() {
        return {
          width: 0,
          height: 0,
          x: mouseState.x,
          y: mouseState.y,
          top: mouseState.y,
          left: mouseState.x,
          right: mouseState.x,
          bottom: mouseState.y
        };
      }
    }
  })
  const handleMouseMove = throttle((e) => {
    mouseState.x = e.clientX;
    mouseState.y = e.clientY;
  }, 50, { trailing: true });
  onMounted(() => {
    document.addEventListener('mousemove', handleMouseMove)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousemove', handleMouseMove)
  })
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
  animation: 1s virtual-cursor infinite;
  /* transition: all 0.1s linear; */
}
@keyframes virtual-cursor {
  0% { scale: 1; }
  50% { scale: 1.1; }
}

</style>
