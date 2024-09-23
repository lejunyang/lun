---
title: ContextConfig 上下文配置
lang: zh-CN
---

## 类型

```ts
declare const GlobalContextConfig: {
  lang: string;
  iconRegistryMap: Record<string, IconLibrary>;
  dynamicStyles: Record<OpenShadowComponentKey | 'common', ((vm: ComponentInternalInstance) => string)[]>
  theme: {
    [key in keyof ThemeProps]: ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>;
  },
  zIndex: {
    teleport: number,
    dialog: number,
    popover: number,
    tooltip: number,
    message: number,
  },
}
```


<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->