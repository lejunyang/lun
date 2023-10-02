## 基本使用

<l-button label="按钮" />
<l-button label="加载中" loading />

## 异步函数自动禁用

<l-button :asyncHandler="countdown3s">异步处理3s</l-button>

<script setup>
const countdown3s = () => new Promise(res => setTimeout(res, 3000));
</script>