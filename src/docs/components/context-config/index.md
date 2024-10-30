---
title: ContextConfig 上下文配置
lang: zh-CN
---

目前`GlobalContextConfig`是全局动态生效的，更改后所有组件都会变更，以后会提供`l-context-config-provider`来局部动态配置

## 类型

```ts
declare const GlobalContextConfig: {
  /** 当前语言，其会影响到组件文本的本地化，目前仅支持'zh-CN'和'en' */
  lang: string;
  /** 全局icon library的注册配置 */
  iconRegistry: Record<string, IconLibrary>;
  /** 全局组件动态样式，可以动态更改，可以根据组件属性来动态生成，详情见指南 */
  dynamicStyles: Record<OpenShadowComponentKey | 'common', ((vm: ComponentInternalInstance) => string)[]>;
  /** 全局主题配置，可直接设置某个主题的值，也可根据组件设置 */
  theme: {
    [key in keyof ThemeProps]: ThemeProps[key] | Record<OpenShadowComponentKey | 'common', ThemeProps[key]>;
  };
  /** 全局z-index配置，可设置悬浮组件的z-index值 */
  zIndex: {
    teleport: number;
    dialog: number;
    popover: number;
    tooltip: number;
    message: number;
  };
};
```
