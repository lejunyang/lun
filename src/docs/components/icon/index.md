---
title: Icon 图标
lang: zh-CN
---

<script setup>
import { registerIconLibrary, svgFillAndSizeDefaultMutator } from '@lun-web/components';

registerIconLibrary({
  library: 'font-awesome',
  type: 'html-url',
  resolver: (name) => {
    const filename = name.replace(/^fa[rbs]-/, '');
    let folder = 'regular';
    if (name.substring(0, 4) === 'fas-') folder = 'solid';
    if (name.substring(0, 4) === 'fab-') folder = 'brands';
    return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.1/svgs/${folder}/${filename}.svg`;
  },
  mutator: (svg) => {
    return svgFillAndSizeDefaultMutator(svg);
  },
});
</script>

## 内置默认图标

图标需要指定图标名称`name`和图标库`library`，不指定图标库或库为`default`时则使用内置图标。内置图标的大小由`font-size`决定，颜色由`color`决定。

<!-- @Code:defaultLibrary -->

## 自定义图标库

使用`registerIconLibrary`方法可以注册自定义图标库，注册后即可使用该图标库的图标，其接收的参数为：

```ts
export interface IconLibrary {
  library: string; // library name
  type: 'html' | 'html-url' | 'vnode' | 'svg-sprite-href';
  resolver: IconLibraryResolver;
  mutator?: IconLibraryMutator;
}
export type IconLibraryResolver = (
  name: string,
  attrs: Record<string, unknown>,
) => string | VNode | Promise<string> | Promise<VNode>;
export type IconLibraryMutator = <T extends string | VNode>(result: T) => T;
```

根据不同的`type`，`resolver`需要根据图标 name 返回不同的结果：

- `html`：返回对应图标的 svg 字符串
- `html-url`：返回对应图标的 url，该 url 需要返回 svg 字符串，组件会请求该 url 并缓存结果。默认使用`fetch`请求，可通过全局配置`iconRequest`自定义
- `vnode`：返回对应图标的 vnode

而`mutator`则可以对返回的结果做进一步修改

下面为注册 font-awesome 图标库的例子

```js
import { registerIconLibrary, svgFillAndSizeDefaultMutator } from '@lun-web/components';

registerIconLibrary({
  library: 'font-awesome',
  type: 'html-url',
  resolver: (name) => {
    const filename = name.replace(/^fa[rbs]-/, '');
    let folder = 'regular';
    if (name.substring(0, 4) === 'fas-') folder = 'solid';
    if (name.substring(0, 4) === 'fab-') folder = 'brands';
    return `https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@5.15.1/svgs/${folder}/${filename}.svg`;
  },
  mutator: (svg) => {
    return svgFillAndSizeDefaultMutator(svg);
  },
});
```

<!-- @Code:fontAwesome -->