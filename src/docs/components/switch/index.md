---
title: Switch 开关
lang: zh-CN
---

## 基本使用

<l-switch checked />

## 禁用

<l-switch disabled checked />
<l-switch disabled />

## 加载中

<l-switch loading checked />
<l-switch loading />

## 自定义图标

<l-switch>
  <l-icon slot="thumb" name="x" />
</l-switch>

:::tip 注
当为 loading 状态时会优先展示 loading 图标，而不是自定义的 thumb 图标
:::

## 带有文字

<l-switch falseText="false" trueText="true" />

## 不同大小

<div class="container align-end">
  <l-switch size="1" />
  <l-switch size="2" />
  <l-switch size="3" />
</div>

## 不同圆角

<div class="container">
  <l-switch radius="none" />
  <l-switch radius="small" />
  <l-switch radius="medium" />
</div>

:::tip 注
对于 Switch，radius 为`large`和`full`时的表现与`medium`相同
:::
