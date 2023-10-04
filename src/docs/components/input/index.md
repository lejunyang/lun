
## 基础使用

<l-input />

<script setup>
  import {reactive, watch} from 'vue';
  const state = reactive({
    value: 'input',
  })
  watch(() => state.value, (val) => {
    console.log('val', val);
  })
</script>