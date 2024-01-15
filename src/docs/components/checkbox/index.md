---
title: Checkbox 复选框
lang: zh-CN
---

<script setup>
import { themeColors } from '@lun/components';
</script>

## 基本使用

<!-- @Code:basicUsage -->

## 选项组

<!-- @Code:checkboxGroup -->

:::warning 注
没有 value 的选项无法进行选择，其只会跟随该 group 的全选状态而改变
:::

## 选项组无选项

<l-checkbox-group @update="console.log('no children', $event.detail)">
<l-checkbox checkForAll>全选</l-checkbox>
</l-checkbox-group>

<l-checkbox-group @update="console.log('no value', $event.detail)">
<l-checkbox checkForAll>全选</l-checkbox>
<l-checkbox>无 value</l-checkbox>
</l-checkbox-group>

## 不同变体
<!-- @Code:differentVariants -->

## 不同颜色

<div class="container">
  <l-checkbox v-for="color in themeColors" :color="color" checked>{{ color }}</l-checkbox>
</div>

## 不同大小

<div class="container">
  <l-checkbox size="1">size1</l-checkbox>
  <l-checkbox size="2">size2</l-checkbox>
  <l-checkbox size="3">size3</l-checkbox>
</div>
