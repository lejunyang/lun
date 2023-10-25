## 基础使用

<l-input />

## 多值

<l-input multiple :value="state.multi" @update="state.multi = $event.detail"  />

## 展示长度

<l-input showLengthInfo maxLength="10" />

## 浮动标签

<l-input label="label" labelType="float" />

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
