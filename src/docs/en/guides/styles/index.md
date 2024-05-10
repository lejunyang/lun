<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->
---
title: 自定义样式
lang: zh-CN
---

目前可通过以下方式自定义元素内部样式：

1. CSS 变量（目前不够齐全，样式还未稳定）
2. `::part`伪元素
3. `innerStyle`属性，每个拥有 Open Shadow DOM 的元素均支持该属性，通过它可直接向该元素内部注入样式，无需再写繁琐的::part

```html
<l-button inner-style="button { color: red }"></l-button>
```

4. `GlobalStaticConfig.styles` 可自定义某个或所有组件的样式，需要在组件使用之前调用，不可动态更改。支持样式字符串和`CSSStyleSheet`（如果兼容的话）

```js
GlobalStaticConfig.styles.button.push(`button { color: red }`);
GlobalStaticConfig.styles.common.push(`:host { display: inline-flex }`); // 所有组件
```

5. `GlobalContextConfig.dynamicStyles` 可动态设置某个或所有组件的样式，具有响应式，且可以设置为函数以根据组件的属性来变化。支持样式字符串和`CSSStyleSheet`

```js
GlobalContextConfig.dynamicStyles.button.push(`button { color: red }`);
GlobalContextConfig.dynamicStyles.button.push((vm) => (vm.props.variant === 'surface' ? 'button { color: blue }' : ''));
```

6. `l-context-config-provider` 同`GlobalContextConfig`，但作用范围为其下的子元素，未实现