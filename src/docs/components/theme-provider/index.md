---
title: ThemeProvider 主题
lang: zh-CN
---

- ThemeProvider本身不渲染任何东西，其用于提供主题各项的值并承载主题CSS变量
- ThemeProvider的可设置的属性与`ThemeProps`相同，其会将props与`GlobalContextConfig`中的`theme`融合并提供给后代

## 类型
```ts
export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;

export type ThemeProps = {
  size?: Responsive<"1" | "2" | "3">;
  color?: ThemeColor;
  variant?: string;
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  highContrast?: boolean;
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