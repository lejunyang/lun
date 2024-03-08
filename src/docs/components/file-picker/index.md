---
title: FilePicker 文件选择
lang: zh-CN
---

- 组件本身不渲染任何内容，而是直接渲染子节点
- 优先会使用[`showOpenFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)(检测到当前浏览器{{tip}}该 API)，若不支持则改为 input，可通过`preferFileApi`属性修改该行为

## 基本使用

<!-- @Code:basicUsage -->

## 多选

通过`multiple`属性可开启多选，通过`maxCount`属性限制文件数量，多选择的文件会被忽略，可通过`exceedMaxCount`事件检查哪些文件被忽略

<!-- @Code:multiple -->

## 限制大小

通过`maxSize`可限制选择文件的大小，单位为字节，超过大小的文件会被忽略，可通过`exceedMaxSize`事件检查哪些文件被忽略

<!-- @Code:maxSize -->

<script setup>
import { isSupportFileSystem } from '@lun/utils';
const tip = isSupportFileSystem() ? '支持' : '不支持';
</script>
