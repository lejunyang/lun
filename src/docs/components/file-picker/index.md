---
title: FilePicker 文件选择
lang: zh-CN
---

- 组件本身不渲染任何内容，而是直接渲染子节点
- 优先会使用[`showOpenFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)(检测到当前浏览器{{tip}}该API)，若不支持则改为input，可通过`preferFileApi`属性修改该行为

## 基本使用

<!-- @Code:basicUsage -->

<script setup>
import { isSupportFileSystem } from '@lun/utils';
const tip = isSupportFileSystem() ? '支持' : '不支持';
</script>