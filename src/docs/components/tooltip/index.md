---
title: Tooltip 提示
lang: zh-CN
---

## 溢出行为
通过设置`overflow`属性，Tooltip可配置内容溢出后的表现，可选值有：
- `open`: 当内容溢出后始终展示tooltip
- `enable`: 当内容溢出后`trigger`才生效

<div style="display: flex; gap: 10px">
  <l-input :value="state.overflowInput" @update="state.overflowInput = $event.detail" />
  <l-tooltip class="overflow" overflow="open">
    <div slot="tooltip">溢出提示</div>
    {{ state.overflowInput }}
  </l-tooltip>
  <l-tooltip class="overflow" overflow="enable">
    <div slot="tooltip">溢出提示</div>
    {{ state.overflowInput }}
  </l-tooltip>
</div>

<script setup>
  import { reactive } from 'vue';
  const state = reactive({
    overflowInput: '溢出溢出溢出溢出'
  })
</script>

<style>
  .overflow {
    overflow: hidden;
    max-width: 100px;
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
