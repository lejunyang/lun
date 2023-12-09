---
title: CustomRenderer 自定义渲染
lang: zh-CN
---

## 渲染 ReactElement

<l-custom-renderer type="react" :content="createElement('div', { style: { color: 'blue', userSelect: 'none', cursor: 'pointer' }, onClick: () => state.count++ }, `React click to add: ${state.count}`)" />

<script setup>
  import { createElement } from 'react';
  import { reactive } from 'vue';
  const state = reactive({
    count: 1,
  })
</script>
