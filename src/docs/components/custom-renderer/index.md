---
title: CustomRenderer 自定义渲染
lang: zh-CN
---

customElement 的一个局限性便在于很难自定义其内容，slot 也无法做到像 vue 那样的作用域插槽，该组件便是为了去渲染需要高度自定义的内容

- `l-custom-renderer`通过`content`属性来指定需要自定义渲染的内容，其可以为函数，当为函数时视为 getter
- `l-custom-renderer`通过`type`属性来指定渲染的类型，若不指定则会自动检测，默认支持 vnode, html 字符串和 HTMLTemplateElement，通过调用`registerCustomRenderer`可自定义其他渲染器。自定义渲染器需要提供的函数如下所示，必须提供`isValidContent`和`onMounted`

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

- 部分内部组件的使用了自定义渲染器，如 input 的 tagRenderer，popover 的 content 等等

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

## 渲染 HTMLTemplateElement

为了使`template`能够动态渲染某些内容，内部有如下的生成替换规则：

- 若`template`有`data-element`属性，则其为动态模板，`data-element`属性指定另一个 html 元素的名字，会将模板替换为该元素
- 对于动态模板的上其他`data-*`属性，会将它们全部通过 prop 或 attr 设置到生成的元素上，例如`data-inner-text="text"`意味着会将元素的 innerText 设为 text
- 若属性的值被`{}`包裹，则其为动态属性，会从`l-custom-renderer`的 attrs 上取对应值，例如`data-label="{text}"`意味着会将`l-custom-renderer`的 text 属性的值设为其值

推荐直接使用 Vnode 渲染，如`content={({ h }) => h('div', 'test')}`

<!-- @Code:template -->
