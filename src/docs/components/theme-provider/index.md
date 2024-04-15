---
title: ThemeProvider 主题
lang: zh-CN
---

- `theme-provider`本身不渲染任何东西，其用于提供主题各项的值并承载主题 CSS 变量
- `theme-provider`的可设置的属性与`ThemeProps`相同，其会将 props 与`GlobalContextConfig`中的`theme`融合并提供给后代
- 拥有主题的组件也会拥有全部或部分`ThemeProps`，主题有继承关系，优先以组件自身设置的生效

## 主题属性

```ts
export type Breakpoints = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Responsive<T> = T | Partial<Record<Breakpoints, T>>;

export type ThemeProps = {
  // 组件大小
  size?: Responsive<'1' | '2' | '3'>;
  // 主题色
  color?: ThemeColor;
  // 变体
  variant?: string;
  // 圆角
  radius?: 'none' | 'small' | 'medium' | 'large' | 'full';
  // 是否高对比
  highContrast?: boolean;
  // 夜间模式
  appearance?: 'light' | 'dark';
  // 缩放
  scale?: '0.9' | '0.95' | '1' | '1.05' | '1.1',
};
```
