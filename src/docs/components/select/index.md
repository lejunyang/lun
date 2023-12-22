---
title: Select 下拉列表
lang: zh-CN
---

## 基本使用

<l-select :options="options" :value="state.value" @update="state.value = $event.detail">
<l-select-option value="value4">option4</l-select-option>
</l-select>

## 多选
使用`hideOptionWhenSelected`属性可以隐藏已选择选项
<!-- @Code:multiple -->

## 选项分组

<!-- @Code:group -->

## 无选项

<l-select></l-select>
<l-select>
  <div slot="no-content">Ops~ No content</div>
</l-select>

## 函数式选项

<!-- @Code:functionOption -->

## 不同颜色

<!-- @Code:differentColors -->

## 不同大小

<!-- @Code:differentSizes -->

## 主题继承

`select-option`会继承`select-optgroup`或`select`的主题设置，优先从近

多选时，输入框中的tag会继承其对应`select-option`的主题设置

<!-- @Code:tagInheritTheme -->

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
