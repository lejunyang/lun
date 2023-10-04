## 基本使用

<l-radio-group :value="3" @update="state.value = $event.detail">
  <l-radio :value="1">单选</l-radio>
  <l-radio :value="2" disabled>单选</l-radio>
  <l-radio :value="3">单选</l-radio>
</l-radio-group>

<script setup>
  import {reactive, watch} from 'vue';
  const state = reactive({
    value: 3,
  })
  watch(() => state.value, (val) => {
    console.log('val', val);
  })
</script>
