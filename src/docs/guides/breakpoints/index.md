---
title: 响应式断点
lang: zh-CN
---

## 响应式断点属性

```ts
export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;
```
具有 Responsive 的属性均可以根据屏幕断点配置不同的值，当屏幕宽度发生变化后会自动取对应的值。breakpoints 可在`GlobalStaticConfig`中配置，默认值为

```js
const breakpoints = {
  xs: '520px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1640px',
}
```

以主题属性中的size为例，其为响应式断点属性，这意味着 size 可以传递以下类型的值

```ts
type Size =
  | '1'
  | '2'
  | '3'
  | {
      initial?: '1' | '2' | '3';
      xs?: '1' | '2' | '3';
      sm?: '1' | '2' | '3';
      md?: '1' | '2' | '3';
      lg?: '1' | '2' | '3';
      xl?: '1' | '2' | '3';
    };
```

## 当前屏幕断点

```ts
import { activeBreakpoint } from '@lun-web/components';
```
通过上面的代码可以获取当前屏幕断点，当前为 **{{ activeBreakpoint }}**

<script setup>
import { activeBreakpoint } from '@lun-web/components';
</script>
