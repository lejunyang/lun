---
title: ThemeProvider 主题
lang: zh-CN
---

- `theme-provider`本身不渲染任何东西，其用于提供主题各项的值并承载主题CSS变量
- `theme-provider`的可设置的属性与`ThemeProps`相同，其会将props与`GlobalContextConfig`中的`theme`融合并提供给后代
- 拥有主题的组件也会拥有全部或部分`ThemeProps`，主题有继承关系，优先以组件自身设置的生效

## 类型
```ts
export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;

export type ThemeProps = {
  // 组件大小
  size?: Responsive<"1" | "2" | "3">;
  // 主题色
  color?: ThemeColor;
  // 变体
  variant?: string;
  // 圆角
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  // 是否高对比
  highContrast?: boolean;
  // 夜间模式
  appearance?: "light" | "dark"
}
```

具有Responsive的属性均可以根据断点配置（目前仅`size`支持），当屏幕宽度发生变化后会自动取对应的值，breakpoints可在`GlobalStaticConfig`中配置，默认值为
```js
{
  xs: '520px',
  sm: '768px',
  md: '1024px',
  lg: '1280px',
  xl: '1640px',
}
```