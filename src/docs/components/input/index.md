## 基础使用

<l-input />

## 多值

<l-input multiple :value="state.multi" @update="state.multi = $event.detail"  />

<script setup>
  import {reactive, watch} from 'vue';
  const state = reactive({
    value: 'input',
    multi: ['1', '2', '3']
  })
  watch(() => state.value, (val) => {
    console.log('val', val);
  })
</script>
