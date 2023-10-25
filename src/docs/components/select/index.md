## 基础使用

<l-select :options="options" :value="state.value" @update="state.value = $event.detail">
<l-select-option value="value4">option4</l-select-option>
</l-select>

## 多选

<l-select multiple :options="options" :value="state.values" @update="state.values = $event.detail">
</l-select>

## 无选项

<l-select></l-select>

<l-select>
  <div slot="no-content">Ops~ No content</div>
</l-select>

<script setup>
  import { reactive } from 'vue';
  const state = reactive({
    value: null,
    values: [],
  })
  const options = [
    { label: 'option1', value: 'value1' },
    { label: 'option2', value: 'value2', disabled: true },
    { label: 'option3', value: 'value3' },
  ]
</script>

<style>
  
</style>