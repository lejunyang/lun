## 基本使用

<l-button label="按钮" />
<l-button label="加载中" loading />

## 异步函数自动禁用

<l-button :asyncHandler="countdown3s">异步处理 3s</l-button>

## 按住模式

按住模式下，需要按住按钮一段时间才会触发点击事件，适用于需要用户小心确认的情况
<l-button holdOn="1500" @l-click="click">按住 1.5s 确认</l-button>
<l-button holdOn="1000" :asyncHandler="countdown3s">1s 确认,3s 加载</l-button>

## 防抖和节流

<l-button debounce="500" @l-click="console.log('debounce click', $event)">防抖 500ms</l-button>
<l-button throttle="500" @l-click="console.log('throttle click', $event)">节流 500ms</l-button>

<script setup>
const countdown3s = () => new Promise(res => setTimeout(res, 3000));
const click = () => alert('OK')
</script>