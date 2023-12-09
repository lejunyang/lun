---
title: Form 表单
lang: zh-CN
---

## 所有表单组件

<l-form :form="form">
  <l-form-item name="input" label="输入">
    <l-input />
  </l-form-item>
  <l-form-item name="array" array label="数组">
    <l-input />
    <l-input />
  </l-form-item>
  <l-form-item name="obj.input1" label="对象1">
    <l-input />
  </l-form-item>
  <l-form-item name="obj.input2" label="对象2">
    <l-input />
  </l-form-item>
  <l-form-item name="checkbox" label="复选框组">
    <l-checkbox-group :options="state.options" />
  </l-form-item>
  <l-form-item name="radio" label="单选框组">
    <l-radio-group :options="state.options" />
  </l-form-item>
  <l-form-item name="select" label="下拉框">
    <l-select :options="state.options" />
  </l-form-item>
  <l-form-item name="selects" label="多选下拉框">
    <l-select :options="state.options" multiple />
  </l-form-item>
</l-form>

<pre>{{ JSON.stringify(state.formData) }}</pre>

<script setup>
  import { reactive } from 'vue';
  import { useForm } from '@lun/components';
  const form = useForm();
  const state = reactive({
    formData: {},
    options: Array(2).fill(0).map((_, index) => ({ value: `option${index}`, label: `option${index}` }))
  })
</script>
