---
title: 如何使用
lang: zh-CN
---

## 使用

```js
import { GlobalStaticConfig, defineAllComponents } from '@lun/components';
import '@lun/theme/public.css'; // 引入公共主题样式
import {
  importCommonStyle,
  importBasicTheme,
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
} from '@lun/theme';

// 定义组件前设置想要更改的全局静态配置
GlobalStaticConfig.xx = xx;
// 定义全部组件或部分组件
defineAllComponents();
// 引入组件内部公共样式
importCommonStyle();
// 引入组件基础主题
importBasicTheme();
// 引入其他主题
importSurfaceTheme();
importOutlineTheme();
importSoftTheme();
importSolidTheme();
```

## 兼容性

至少需要兼容`customElement`, 列出的其他特性为所需版本大于`customElement`的, 若不支持可考虑 polyfill 或移除某些特性

- [customElement](https://caniuse.com/?search=customElement) (chrome>=54, edge>=79, firefox>=63, safari>=10.3)
- [BigInt](https://caniuse.com/?search=BigInt) (firefox>=68, safari>=14)
- [Dialog](https://caniuse.com/?search=Dialog) (firefox>=98, safari>=15.4)
- [flatMap](https://caniuse.com/?search=flatMap) (chrome>=69, safari>=12)
- [Named capture group](https://caniuse.com/?search=Named%20capture%20group) (chrome>=64, firefox>=78, safari>=11.3)
- [CSS :where :is](https://caniuse.com/?search=where) (chrome>=88, edge>=88, firefox>=78, safari>=14)
- [CSS Logical Properties](https://caniuse.com/?search=CSS%20Logical%20Properties) (chrome>=89, edge>=89, firefox>=66, safari>=15)

某些特性需要的版本较高, 但它们在内部有做不兼容降级处理, 如下

- [adoptedStyleSheets](https://caniuse.com/?search=adoptedStyleSheets)
- [popover](https://caniuse.com/?search=popover)
- [showOpenFilePicker](https://caniuse.com/?search=showOpenFilePicker)
- [CSS color()](https://caniuse.com/?search=display%20p3)
