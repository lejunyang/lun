---
title: Icon 图标
lang: zh
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

<l-icon name="clear" />
<l-icon name="up" />
<l-icon name="down" />

```html
<l-icon name="clear" />
<l-icon name="up" />
<l-icon name="down" />
```

## 注册 SVG 图标库
下面为注册font-awesome图标库的例子

<l-icon library="font-awesome" name="far-bell" />
<l-icon library="font-awesome" name="fas-archive" />
<l-icon library="font-awesome" name="fab-apple" />

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