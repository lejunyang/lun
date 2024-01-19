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

`checkbox-group`下的任一`checkbox`，可通过添加`checkForAll`属性使其变为控制该组全选状态的复选框

<!-- @Code:checkboxGroup -->

:::warning 注
全选会无视 disabled 选项，但是 readonly 选项会被改变（该行为存疑）

没有 value 的选项无法进行选择，其只会跟随该 group 的全选状态而改变
:::

## 纵向选项组

<!-- @Code:verticalGroup -->

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
