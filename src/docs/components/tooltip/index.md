---
title: Tooltip 提示
lang: zh-CN
---

Tooltip 基于 Popover，但是比其多了一个功能，即检测 overflow 并决定是否展示

## 溢出行为

通过设置`overflow`属性，Tooltip 可配置内容溢出后的表现，可选值有：

- `open`: 当内容溢出后始终展示 tooltip
- `enable`: 当内容溢出后启用 tooltip，通过`triggers`来设定触发方式

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

## 单例监听多个目标

类似于 Popover，通过`attachTarget`方法可以使 Tooltip 监听多个目标，同时会将它们也添加为 Popover target。想要监听额外目标是否溢出，则需要指定`overflow`选项

值得注意的是，若多个目标将`overflow`设为`open`且它们都溢出了，Tooltip 会在第一个溢出的元素处展示

```ts
attachTarget: (el: Element, options?: {
  overflow?: MaybeRefLikeOrGetter<'enable' | 'open'>;
  isDisabled?: MaybeRefLikeOrGetter<boolean>;
  /** 手动指定元素的文本，不指定则：当元素有value属性时取value，否则取innerText */
  getText?: (el: HTMLElement) => string;
  /** 默认为true */
  trim?: boolean;
  /** 检查溢出时是否测量文本的宽度，默认为true */
  measure?: boolean;
}) => void
```

<!-- @Code:extraTargets -->

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
