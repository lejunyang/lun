---
title: CustomRenderer 自定义渲染
lang: zh-CN
---

customElement 的一个局限性便在于很难自定义其内容，slot 也无法做到像 vue 那样的作用域插槽，该组件便是为了去渲染需要高度自定义的内容

- `custom-renderer`通过`content`属性来指定需要自定义渲染的内容，其可以为函数，当为函数时视为 getter
- `custom-renderer`通过`type`属性来指定渲染的类型，默认支持 vnode, html 字符串和 HTMLTemplateElement，通过调用`registerCustomRenderer`可自定义其他渲染器。自定义渲染器需要提供的函数如下所示，必须提供`isValidContent`和`onMounted`

```ts
export type CustomRendererRegistry = {
  isValidContent: (content: any) => boolean;
  onMounted: (content: any, target: HTMLDivElement, otherProps: Record<string | symbol, unknown>) => void;
  onUpdated?: (content: any, target: HTMLDivElement, otherProps: Record<string | symbol, unknown>) => void;
  onBeforeUnmount?: (content: any, target: HTMLDivElement) => void;
  clone?: (content?: any) => any;
};
export function registerCustomRenderer(type: string, registry: CustomRendererRegistry);
```

- 部分内部组件的使用了自定义渲染器，如 input 的 tagRenderer，popover 的 content等等

## 渲染 ReactElement

通过如下代码注册 React 自定义渲染器，使得组件库支持渲染 ReactElement

```ts
import { registerCustomRenderer } from '@lun/components';
import { isValidElement, cloneElement } from 'react';
import { createRoot } from 'react-dom/client';

const reactRootMap = new WeakMap();
registerCustomRenderer('react', {
  isValidContent(content) {
    return isValidElement(content);
  },
  onMounted(content, target) {
    if (reactRootMap.has(target)) return;
    const root = createRoot(target);
    reactRootMap.set(target, root);
    root.render(content);
  },
  onUpdated(content, target) {
    reactRootMap.get(target)?.render(content);
  },
  onBeforeUnmount(target) {
    reactRootMap.get(target)?.unmount();
    reactRootMap.delete(target);
  },
  clone(content) {
    return cloneElement(content);
  },
});
```

<!-- @Code:reactElement -->
