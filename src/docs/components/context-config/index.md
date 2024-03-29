---
title: ContextConfig 上下文配置
lang: zh-CN
---

## 类型

```ts
declare const GlobalContextConfig: {
  namespace: string;
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

