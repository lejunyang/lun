## 基础使用

<l-button @click="state.open = !state.open; console.log('click', state.open);">展示</l-button>
<l-dialog :open="state.open" modal headerTitle="标题" @update="state.open = $event.detail" :beforeOk="countdown3s" :beforeClose="handleCancel">
  <div>内容</div>
</l-dialog>

<script setup>
  import { reactive } from 'vue';
  const state = reactive({
    open: false
  })
  const countdown3s = () => new Promise(res => setTimeout(res, 3000));
  const handleCancel = async () => {
    await countdown3s();
    return false;
  }
</script>
