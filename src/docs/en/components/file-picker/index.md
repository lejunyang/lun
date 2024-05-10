<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->
---
title: FilePicker 文件选择
lang: zh-CN
---

- 组件本身默认直接渲染子节点，不渲染其他内容，除非指定了`filesRenderer`
- 优先会使用[`showOpenFilePicker`](https://developer.mozilla.org/en-US/docs/Web/API/Window/showOpenFilePicker)(**检测到当前浏览器{{tip}}该 API**)，若不支持则改为 input，可通过`preferFileApi`属性修改该行为

## 基本使用

<!-- @Code:basicUsage -->

## 多选

通过`multiple`属性可开启多选，通过`maxCount`属性限制文件数量，多选择的文件会被忽略，可通过`exceedMaxCount`事件检查哪些文件被忽略

<!-- @Code:multiple -->

## 目录

通过`directory`属性可开启目录选择

<!-- @Code:directory -->

## 取消事件

`file-picker`在取消文件选择时会触发`cancel`事件，内部采用了兼容方式实现：
- 若使用文件系统API，在AbortError时触发cancel
- 若使用input且浏览器支持[input cancel](https://caniuse.com/?search=HTMLInputElement%20cancel)事件，input触发cancel时往外抛出cancel
- 上面两个兼容性均不佳，所以会同时使用pointerover, pointerdown, keydown, visibilitychange事件共同监听，支持移动端

:::details 兼容实现的逻辑
模拟实现input cancel事件目前没有一个完美的解决方案，focus事件没有用，目前检查文件选择是否被取消的时机是：
- pointerdown或keydown触发（文件选择时的esc不会触发keydown）
- 连续两次（小于50ms）pointermove触发（检测两次是因为Chromium中，鼠标从文件窗口移到外面也会触发一次pointermove。。。）
- 支持touch的设备（不包含ios和ipad）会额外检测visibilitychange事件。在触屏windows设备中，选择文件时不会触发visibilitychange（有待更多测试）；在安卓中，选择文件会使页面进入后台，IOS则不会（所以在不支持cancel事件的IOS中，取消选择后必须摸一次屏幕才会检测到，体验不行，暂未找到解决方案）
:::

<!-- @Code:cancel -->

## 限制大小

通过`maxSize`可限制选择文件的大小，单位为字节，超过大小的文件会被忽略，可通过`exceedMaxSize`事件检查哪些文件被忽略

<!-- @Code:maxSize -->

<script setup>
import { isSupportFileSystem } from '@lun/utils';
const tip = isSupportFileSystem() ? '支持' : '不支持';

</script>
