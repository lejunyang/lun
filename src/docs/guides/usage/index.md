---
title: 如何使用
lang: zh-CN
---

- `@lun/utils`：js 工具函数库
- `@lun/core`：提供组件功能的钩子函数库
- `@lun/components`：组件库
- `@lun/theme`：主题库
- `@lun/react`：为 react 封装的组件库，详细见下文

## React 中使用

React 是目前流行 web 框架唯一不支持`customElement`的，详情见[`Custom Elements Everywhere`](https://custom-elements-everywhere.com/)。在 React 18 及之前版本中使用自定义元素，只会将属性设置为 attribute，不会自动设置为元素的 property，也无法使用`onXXX`监听自定义元素的事件

React 19 即将支持`customElement`，但目前还处于实验阶段，静待 2024 年中，目前我们需要手动封装一层。`@lun/react`将`@lun/components`中的每个组件都封装成了 React 组件，在 useLayoutEffect 中将属性和事件绑定到元素上，使之能够正常工作。

```tsx
import { LInput } from '@lun/react';

export default function () {
  return <LInput onUpdate={() => {}} />;
}
```

## 安装

暂未发布到 npm

::: tip 注

- 如果只需要组件，样式完全自定义的话，直接安装`@lun/components`即可
- 如果需要主题，只需安装`@lun/theme`（其依赖于`@lun/components`）
- React 中需额外安装`@lun/react`，使用其导出的组件

:::

## 全量引入

```js
import { GlobalStaticConfig, defineAllComponents } from '@lun/components';
import '@lun/theme/public.css'; // 引入公共主题样式
import {
  importCommonTheme,
  importBasicTheme,
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
} from '@lun/theme';

// 定义组件前设置想要更改的全局静态配置
GlobalStaticConfig.xx = xx;
// 引入组件内部公共样式
importCommonTheme();
// 引入所有组件的基础主题
importBasicTheme();
// 引入所有其他主题
importSurfaceTheme();
importOutlineTheme();
importSoftTheme();
importSolidTheme();
// 定义全部组件
defineAllComponents();
```

- 全量引入的组件会使用`GlobalStaticConfig.namespace`加上组件本身的名字作为命名，例如`namespace`默认为`l`，那么`button`组件的默认名字便是`l-button`。引入组件后你便可以在任何地方使用它们
- 全局静态配置需要在组件被使用前修改，但最好在定义前就统一修改，因为`namespace`在定义时就会使用
- 如果你使用了主题，则必须在根节点包裹`l-theme-provider`

## 动态引入

```js
import { autoDefine } from '@lun/components';
import { autoImportTheme } from '@lun/theme';
import '@lun/theme/public.css';

autoImportTheme();
autoDefine();
```

动态引入会自动检测页面上的元素并自动加载引入，动态引入无法 Tree Shaking，但会动态加载需要的脚本

## 自定义引入

```js
import { defineButton } from '@lun/components';
import '@lun/theme/public.css';
import { importButtonBasicTheme, importButtonSurfaceTheme } from '@lun/theme';
```

每个组件都导出了单独的 define 函数，用于单独引入该组件，没有使用的组件最终不会被打包，每个组件的主题也单独提供了 import 函数。
组件的 define 函数可以单独对该组件以及它依赖的组件进行命名，而不是使用默认命名，例如

```js
importButtonBasicTheme();
importButtonSurfaceTheme();
defineButton('my-button', {
  spin: 'my-spin',
});

// 此后你便可以直接使用<my-button></my-button>和<my-spin></my-spin>了
```

:::warning 注
自定义引入需要注意组件的引入顺序，这在 SSR 场景下尤为重要，**最先使用的组件需要最先定义**，例如你可能需要在其他组件定义前先调用`defineThemeProvider`和`defineTeleportHolder()`，有明显父子关系的组件也需要注意，例如`form`和`form-item`

需要这么做的原因是，大部分组件都有继承关系，部分状态由父组件提供。在 SSR 场景下，页面上的元素已经存在，如果子组件先被定义，此时它无法探测到父组件（组件未被定义时是无效组件），等父组件再被定义时子组件也不会被更新，便会出现问题
:::

## 兼容性

至少需要兼容`customElement`, 列出的其他特性为所需版本大于`customElement`的, 若不支持需考虑 polyfill 或移除某些特性

- [customElement](https://caniuse.com/?search=customElement) (chrome>=54, edge>=79, firefox>=63, safari>=10.3)
- [BigInt](https://caniuse.com/?search=BigInt) (firefox>=68, safari>=14)
- [flatMap](https://caniuse.com/?search=flatMap) (chrome>=69, safari>=12)
- [Named capture group](https://caniuse.com/?search=Named%20capture%20group) (chrome>=64, firefox>=78, safari>=11.3)
- [CSS gap in flex](https://caniuse.com/?search=flex-gap) (chrome>=84, edge>=84, safari>=14.1)
- [CSS :where :is](https://caniuse.com/?search=where) (chrome>=88, edge>=88, firefox>=78, safari>=14)
- [CSS Logical Properties](https://caniuse.com/?search=CSS%20Logical%20Properties) (chrome>=89, edge>=89, firefox>=66, safari>=15)

某些特性需要的版本较高, 但它们在内部有做兼容处理或替代方案, 如下

- [adoptedStyleSheets](https://caniuse.com/?search=adoptedStyleSheets)
- [Dialog](https://caniuse.com/?search=Dialog)
- [HTMLSlotElement.assign](https://caniuse.com/?search=HTMLSlotElement.assign)
- [Input cancel Event](https://caniuse.com/?search=HTMLInputElement%20cancel)
- [popover](https://caniuse.com/?search=popover)
- [showOpenFilePicker](https://caniuse.com/?search=showOpenFilePicker)
- [Selection.getComposedRanges](https://caniuse.com/?search=getComposedRanges)
- [CSS Layer](https://caniuse.com/?search=layer)
- [CSS Subgrid](https://caniuse.com/?search=Subgrid)
- [CSS color()](https://caniuse.com/?search=display%20p3)

某些特性无法做兼容，但它们影响不大，只是出于技术探索添加了那些特性，不使用那些功能即可

- `doc-pip`: [DocumentPictureInPicture](https://caniuse.com/?search=DocumentPictureInPicture)
- `mentions`: [CSS highlight](https://caniuse.com/?search=highlight)
