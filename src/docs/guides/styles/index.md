---
title: 自定义样式
lang: zh-CN
---

我们知道Shadow DOM自带样式隔离，这很好用，但是也对自定义样式造成了一定困扰，目前可通过以下方式自定义元素内部样式：

1. CSS 变量（目前不够齐全，样式还未稳定）
2. [`::part`](https://developer.mozilla.org/en-US/docs/Web/CSS/::part)伪元素，其可以让外部样式选中到内部节点并以此编写样式，例如
```css
l-button::part(root) {
  color: red;
}
```
但其仅能选择到对应的节点，不可用于选中后代节点，也无法根据节点的属性进行区分，详细可参考[下一节](/guides/states/)

3. `innerStyle`属性，本组件库每个拥有 Open Shadow DOM 的元素均支持该属性，通过它可直接向该元素内部注入样式，无需再写繁琐的::part，也可以自行添加任意内部 class 的选择器

```html
<l-button
  inner-style="button.is-disabled { opacity: 0.5 } .l-button--size-1 { font-size: 12px }"
></l-button>
```

如果你在框架内使用，可以通过导入内联样式来使用CSS文件，以Vite为例：

```jsx
import style from './style.scss?inline';
<l-button innerStyle={style}></l-button>
```

4. `GlobalStaticConfig.styles` 可自定义某个或所有组件的样式，需要在组件使用之前调用，不可动态更改。支持样式字符串和`CSSStyleSheet`（如果兼容的话）

```js
// 针对按钮组件的样式
GlobalStaticConfig.styles.button.push(`button { color: red }`);
// 针对所有组件的样式
GlobalStaticConfig.styles.common.push(`:host { display: inline-flex }`);
```

也可以通过工具函数设置，这种方式设置样式会经过处理，会受 GlobalStaticConfig 中的`wrapCSSLayer`, `preferCSSStyleSheet`, `stylePreprocessor`的影响

```js
import { createImportStyle } from '@lun-web/components';

const importButtonStyle = createImportStyle('button', 'button { color: red }');
importButtonStyle();
```

5. `GlobalContextConfig.dynamicStyles` 可动态设置某个或所有组件的样式，具有响应式，且可以设置为函数以根据组件的属性来变化。支持样式字符串和`CSSStyleSheet`

```js
GlobalContextConfig.dynamicStyles.button.push(`button { color: red }`);
GlobalContextConfig.dynamicStyles.button.push((vm) => (vm.props.variant === 'surface' ? 'button { color: blue }' : ''));
```

6. `l-context-config-provider` 同`GlobalContextConfig`，但作用范围为其下的子元素，暂未实现
