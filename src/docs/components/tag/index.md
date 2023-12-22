---
title: Tag 标签
lang: zh-CN
---

<script setup>
  import { themeColors } from '@lun/components';
</script>

## 基本使用

<l-tag>标签</l-tag>

## 可删除标签

<l-tag removable @remove="console.log('start remove')" @after-remove="console.log('removed')">标签</l-tag>

## 不同变体

<div class="container">
  <l-tag variant="solid">solid</l-tag>
  <l-tag variant="soft">soft</l-tag>
  <l-tag variant="outline">outline</l-tag>
  <l-tag variant="surface">surface</l-tag>
</div>
<div class="container">
  <l-tag variant="solid" removable tabindex="1">solid</l-tag>
  <l-tag variant="soft" removable tabindex="1">soft</l-tag>
  <l-tag variant="outline" removable tabindex="1">outline</l-tag>
  <l-tag variant="surface" removable tabindex="1">surface</l-tag>
</div>

## 不同颜色

<div class="container">
  <l-tag v-for="color in themeColors" :color="color">{{ color }}</l-tag>
</div>

## 不同大小

<div class="container">
  <l-tag variant="surface" size="1">标签</l-tag>
  <l-tag variant="surface" size="2">标签</l-tag>
  <l-tag variant="surface" size="3">标签</l-tag>
</div>
<div class="container">
  <l-tag variant="surface" size="1" removable>标签</l-tag>
  <l-tag variant="surface" size="2" removable>标签</l-tag>
  <l-tag variant="surface" size="3" removable>标签</l-tag>
</div>

## 高对比度

使用`highContrast`来增加文字与背景的对比度

<div class="container">
  <l-tag variant="solid">solid</l-tag>
  <l-tag variant="soft">soft</l-tag>
  <l-tag variant="outline">outline</l-tag>
  <l-tag variant="surface">surface</l-tag>
</div>
<div class="container">
  <l-tag variant="solid" highContrast>solid</l-tag>
  <l-tag variant="soft" highContrast>soft</l-tag>
  <l-tag variant="outline" highContrast>outline</l-tag>
  <l-tag variant="surface" highContrast>surface</l-tag>
</div>
