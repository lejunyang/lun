---
title: Checkbox 复选框
lang: zh-CN
---

<script setup>
import { themeColors } from '@lun/components';
</script>
## 基本使用

<l-checkbox>勾选</l-checkbox>

## 选项组

<l-checkbox-group @update="console.log('value', $event.detail)">
<l-checkbox checkForAll>全选</l-checkbox>
<l-checkbox :value="1">选项 1</l-checkbox>
<l-checkbox :value="2" disabled>选项 2</l-checkbox>
<l-checkbox :value="3">选项 3</l-checkbox>
<l-checkbox>无 value</l-checkbox>
</l-checkbox-group>

## 选项组无选项

<l-checkbox-group @update="console.log('no children', $event.detail)">
<l-checkbox checkForAll>全选</l-checkbox>
</l-checkbox-group>

<l-checkbox-group @update="console.log('no value', $event.detail)">
<l-checkbox checkForAll>全选</l-checkbox>
<l-checkbox>无 value</l-checkbox>
</l-checkbox-group>

## 不同变体

<div class="container">
  <l-checkbox variant="surface">surface</l-checkbox>
  <l-checkbox variant="soft">soft</l-checkbox>
</div>

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