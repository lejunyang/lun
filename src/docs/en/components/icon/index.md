<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->
---
title: Icon 图标
lang: zh-CN
---

<script setup>
import { registerIconLibrary, svgFillAndSizeDefaultMutator } from '@lun/components';

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

<div>
  Default Icon Library
  <l-icon name="clear" />
  <l-icon name="down" />
  <l-icon name="x" />
  <l-icon name="success" />
  <l-icon name="warning" />
  <l-icon name="error" />
</div>

```html
<l-icon name="clear" />
<l-icon name="down" />
<l-icon name="x" />
<l-icon name="success" />
<l-icon name="warning" />
<l-icon name="error" />
```

## 注册 SVG 图标库

下面为注册 font-awesome 图标库的例子

<div>
  Font Awesome
  <l-icon library="font-awesome" name="far-bell" />
  <l-icon library="font-awesome" name="fas-archive" />
  <l-icon library="font-awesome" name="fab-apple" />
</div>

```js
import { registerIconLibrary, svgFillAndSizeDefaultMutator } from '@lun/components';

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
