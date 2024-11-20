---
title: 如何使用
lang: zh-CN
---

在使用本组件库之前，你需要了解自定义元素的相关知识，可参考[教程](https://zh.javascript.info/web-components)、[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements)或[Vue](https://vuejs.org/guide/extras/web-components.html)，只需知道如何使用即可，无需了解如何创建

## 安装

目前只发布了 alpha 版本，提供以下库：

- [`@lun-web/utils`](https://www.npmjs.com/package/@lun-web/utils)：js 工具函数库
- [`@lun-web/core`](https://www.npmjs.com/package/@lun-web/core)：提供组件功能的钩子函数库
- [`@lun-web/plugins`](https://www.npmjs.com/package/@lun-web/plugins): 为 JSX 或 Vue template 提供自定义指令
- [`@lun-web/components`](https://www.npmjs.com/package/@lun-web/components)：组件库，其依赖于上面三个
- [`@lun-web/theme`](https://www.npmjs.com/package/@lun-web/theme)：主题库，其依赖于组件库
- [`@lun-web/react`](https://www.npmjs.com/package/@lun-web/react)：为 react19 之前的版本封装的组件库，详细见下文[React 中使用](#react-中使用)

根据需要并安装对应的库

```shell
npm i vue # 虽然vue从3.2开始支持自定义元素，但最好使用最新版，中间修复了很多相关问题
npm i @lun-web/components
npm i @lun-web/theme # 如果需要主题，则安装此库
npm i @lun-web/react # 如果在React中使用且早于 React 19，则额外安装此库并使用其导出的组件
```

## React 中使用

React 是目前流行 web 框架中唯一不支持`customElement`的，详情见[`Custom Elements Everywhere`](https://custom-elements-everywhere.com/)。在 React 18 及之前版本中使用自定义元素，只会将属性设置为 attribute，不会自动设置为元素的 property，也无法使用`onXXX`监听自定义元素的事件

React 19 即将支持`customElement`，但目前还处于实验阶段。本文档使用的是 React 19 RC，在文档的 React 代码中可正常使用自定义元素。

对于 React 19 之前的版本，我们需要手动封装一层。`@lun-web/react`将`@lun-web/components`中的每个组件都封装成了 React 组件，在 useLayoutEffect 中将属性和事件绑定到元素上，使之能够正常工作。

```tsx
import { LInput } from '@lun-web/react';

export default function () {
  return <LInput onUpdate={() => {}} />;
}
```

## 全量引入

```js
import { GlobalStaticConfig, defineAllComponents } from '@lun-web/components';
import {
  importCommonTheme
  importAllColors,
  importAllP3Colors,
  importAllThemes
} from '@lun-web/theme';
// 如果使用了日期组件，则必须引入日期处理预设。内部提供了dayjs实现，但需要用户手动引入
import '@lun-web/core/date-dayjs';
// 如果你想要使用其他的日期处理库，可参考左侧“数字和日期处理预设”一栏

// 定义组件前设置想要更改的全局静态配置
GlobalStaticConfig.xx = xx;

// 引入所有的预设主题色
importAllColors(); // 如果需要自定义主题色请参考顶部导航栏中的“调色”一栏
// 如果需要P3广色域支持则调用如下函数，当支持的时候会使用display-p3
// importAllP3Colors();

// 引入所有预设主题
importAllThemes();

// 定义全部组件
defineAllComponents();
```

- 全局静态配置需要在组件被使用前修改，但最好在定义组件前就统一修改，因为`namespace`在定义时就会使用
- 全量引入的组件会使用全局静态配置中的`namespace`加上组件本身的名字作为命名，例如`namespace`默认为`l`，那么`button`组件的默认名字便是`l-button`。定义组件后你便可以在任何地方使用它们
- 在 SSR 的情况下，为保证视觉效果，你需要自行向页面添加类似于下面的样式，在组件未定义时隐藏它们，以避免它们的子元素被渲染出来而造成闪烁

```css
:not(:defined) {
  visibility: hidden;
}
/** or */
:not(:defined) {
  opacity: 0;
}
```

## 动态引入

```js
import { autoDefine } from '@lun-web/components';
import { autoImportTheme } from '@lun-web/theme';

autoImportTheme();
autoDefine();
```

动态引入会自动检测页面上的元素并自动加载引入，动态引入无法 Tree Shaking，但会动态加载需要的脚本

## 自定义引入

```js
import { defineButton } from '@lun-web/components';
import "@lun-web/components/define/theme-provider"; // 也可以直接通过import副作用来调用

// 第二个参数用于给该组件依赖的组件自定义命名
defineButton('my-button', {
  spin: 'my-spin',
});

// 此后你便可以直接使用<my-button></my-button>, <my-spin></my-spin>以及<l-theme-provider></l-theme-provider>
```

每个组件都导出了单独的 define 函数，用于单独引入该组件，没有使用的组件最终不会被打包。

第一个参数用于指定该组件命名，第二个参数用于指定其依赖的组件命名，不传参则是使用默认命名（全局配置）

每个组件的主题提供了单独的 import 函数

```js
import {
  importButtonBasicTheme,
  importButtonSurfaceTheme,
} from '@lun-web/theme';
importButtonBasicTheme();
importButtonSurfaceTheme();
```

主题的引入除了组件维度的单独引入，还可以根据类型直接全部引入

```js
import {
  importCommonTheme, // 所有组件的公共样式
  importBasicTheme, // 所有组件的基础主题
  importSurfaceTheme,
  importOutlineTheme,
  importSoftTheme,
  importSolidTheme,
} from '@lun-web/theme';
```

:::warning 注
自定义引入需要注意组件的引入顺序，这在 SSR 场景下尤为重要，**最先使用的组件需要最先定义**，例如你可能需要在其他组件定义前先调用`defineThemeProvider`和`defineTeleportHolder()`，有明显父子关系的组件也需要注意，例如`form`和`form-item`

需要这么做的原因是，大部分组件都有继承关系，部分状态由父组件提供。在 SSR 场景下，页面上的元素已经存在，如果子组件先被定义，此时它无法探测到父组件（组件未被定义时是无效组件），等父组件再被定义时子组件也不会被更新，便会出现问题
:::

## CDN引入

```html
<script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@lun-web/utils/dist/lun-web-utils.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@lun-web/core/dist/lun-web-core.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@lun-web/plugins/dist/lun-web-plugins-vue.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@lun-web/components/dist/lun-web-components.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@lun-web/theme/dist/lun-web-theme.iife.js"></script>
```

CDN直接引入只提供开发打包版本，不建议在生产环境使用，引入后在全局即可访问

```html
<script>
  LunWebTheme.importAllColors();
  LunWebTheme.importAllP3Colors();
  LunWebTheme.importAllThemes();
  LunWebComponents.defineAllComponents();
</script>
```

## TS 支持

组件库的组件本身具有完整的类型支持，针对不同的框架，目前提供了以下类型定义：

- `@lun-web/components/elements-types-vue`: Vue template 以及 JSX 的组件类型
- `@lun-web/components/elements-types-react`: React JSX 组件类型
- `@lun-web/components/elements-types-html`: document.createElement 组件类型支持

你需要在 TS 配置文件中对应引入它们

需要注意的是，提供的类型文件是针对默认`namespace`，也就是`l-button`, `l-input`等以`l`开头的组件，如果你自定义了命名空间，可以仿造以下示例编写

```ts
// Vue
import * as Vue from 'vue';
// Vue template
declare module 'vue' {
  interface GlobalComponents {
    LButton: Vue.DefineComponent<import('@lun-web/components').ButtonProps>;
  }
}
// Vue JSX
declare module 'vue/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'l-button': Vue.HTMLAttributes & Vue.ReservedProps & import('@lun-web/components').ButtonProps;
    }
  }
}

// React
import * as React from 'react';
declare module 'react/jsx-runtime' {
  namespace JSX {
    interface IntrinsicElements {
      'l-button': React.HTMLAttributes<HTMLElement> &
        React.RefAttributes<import('./index').iButton> &
        import('@lun-web/components').ButtonProps;
    }
  }
}
```

每个组件都有一个 class 和两个类型，注意区分

```ts
import { Button, tButton, iButton } from '@lun-web/components';
Button; // 组件的class，这是值，不是类型，一般用不到
tButton; // 组件class的类型，相当于typeof Button
iButton; // 组件实例的类型，相当于InstanceType<tButton>，这是实际DOM元素的类型
```

当需要组件实例类型时，你可以像下面这样使用：

```ts
import { iButton } from '@lun-web/components';
const button = document.querySelector('l-button') as iButton;
button.asyncHandler = () => console.log('');

const buttonRef = ref<iButton>();
const render = () => <l-button ref={buttonRef}></l-button>;
```

## 兼容性

至少需要兼容`customElement`, 考虑到以下特性版本要求不高, 若不支持你需要自行 polyfill 或不使用某些特性，CSS 不兼容可考虑使用全局配置`stylePreprocessor`处理或自行编写样式

- [customElement](https://caniuse.com/?search=customElement) <SupportInfo chrome="54" edge="79" firefox="63" safari="10.3" />
- [BigInt](https://caniuse.com/?search=BigInt) <SupportInfo chrome="67" edge="79" firefox="68" safari="14" />
- [flatMap](https://caniuse.com/?search=flatMap) <SupportInfo chrome="69" edge="79" firefox="62" safari="12" />
- [fromEntries](https://caniuse.com/?search=fromEntries) <SupportInfo chrome="73" edge="79" firefox="63" safari="12.1" />
- [Named capture group](https://caniuse.com/?search=Named%20capture%20group) <SupportInfo chrome="64" edge="79" firefox="78" safari="11.1" />
- [IntersectionObserver](https://caniuse.com/?search=IntersectionObserver) <SupportInfo chrome="58" edge="16" firefox="55" safari="12.1" />
- [ResizeObserver](https://caniuse.com/?search=ResizeObserver) <SupportInfo chrome="64" edge="79" firefox="69" safari="13.1" />
- [CSS gap in flex](https://caniuse.com/?search=flex-gap) <SupportInfo chrome="84" edge="84"  firefox="63" safari="14.1" />
- [CSS :where :is](https://caniuse.com/?search=where) <SupportInfo chrome="88" edge="88" firefox="78" safari="14" />
- [CSS Logical Properties](https://caniuse.com/?search=CSS%20Logical%20Properties) <SupportInfo chrome="89" edge="89" firefox="66" safari="15" />

:::details 当前用户代理信息
{{ browserInfo }}
:::

某些特性需要的版本较高, 但它们在内部有做兼容处理或替代方案, 渐进式增强能给用户带来更好的体验，详细信息如下

:::info 注
<Support :is="true" /> 当前浏览器支持该特性
<Support :is="false" style="margin-left: 10px;" /> 当前浏览器不支持该特性
<l-icon name="help" style="margin-left: 10px;" /> 无法检测
:::

**Javascript**

- <Support is="promiseTry" /> [Promise.try](https://caniuse.com/?search=Promise.try) <SupportInfo chrome="128" edge="128" firefox="135" safari="18.2" />
- <Support is="withResolvers" /> [Promise.withResolvers](https://caniuse.com/?search=withResolvers) <SupportInfo chrome="119" edge="119" firefox="121" safari="17.4" />
- <Support is="setIntersection" /> [Set.intersection](https://caniuse.com/?search=Set%20intersection) <SupportInfo chrome="122" edge="122" firefox="127" safari="17" />

**Web API**

- <Support is="adoptedStyleSheets" /> [adoptedStyleSheets](https://caniuse.com/?search=adoptedStyleSheets) <SupportInfo chrome="73" edge="79" firefox="101" safari="16.4" />
- <Support is="customState" /> [CustomStateSet](https://caniuse.com/?search=CustomStateSet) <SupportInfo chrome="90" edge="90" firefox="126" safari="17.4" />
- <Support is="Dialog" /> [`dialog`](/components/dialog/): [Dialog](https://caniuse.com/?search=Dialog) <SupportInfo chrome="37" edge="79" firefox="98" safari="15.4" />
- <Support is="slotAssign" /> [HTMLSlotElement.assign](https://caniuse.com/?search=HTMLSlotElement.assign) <SupportInfo chrome="86" edge="86" firefox="92" safari="16.4" />
- <Support is="inputCancel" /> [Input cancel Event](https://caniuse.com/?search=HTMLInputElement%20cancel) <SupportInfo chrome="113" edge="113" firefox="91" safari="16.4" />
- <Support is="popover" /> [`popover`](/components/popover/#实现方式): [Popover API](https://caniuse.com/?search=popover) <SupportInfo chrome="114" edge="114" firefox="125" safari="17" />
- <Support is="showOpenFilePicker" /> [showOpenFilePicker](https://caniuse.com/?search=showOpenFilePicker) <SupportInfo chrome="86" edge="86" firefox="no" safari="no" />
- <Support is="getComposedRanges" /> [`mentions`](/components/mentions/): [getComposedRanges](https://caniuse.com/?search=getComposedRanges) <SupportInfo chrome="no" edge="no" firefox="134" safari="17" />

**CSS**

- <Support is="anchorPosition" /> [CSS anchor positioning](https://caniuse.com/?search=anchor%20position) <SupportInfo chrome="125" edge="125" firefox="no" safari="no" />
- <Support is="height" /> [CSS auto height transition](https://caniuse.com/?search=calc-size) <SupportInfo chrome="129" edge="129" firefox="no" safari="no" />
- <Support is="color" /> [CSS color()](<https://caniuse.com/?search=color()>) <SupportInfo chrome="111" edge="111" firefox="113" safari="15" />
- <Support is="content" /> [CSS content-visibility](https://caniuse.com/?search=content-visibility) <SupportInfo chrome="85" edge="85" firefox="125" safari="18" />
- <Support is="layer" /> [CSS layer](https://caniuse.com/?search=layer) <SupportInfo chrome="99" edge="99" firefox="97" safari="15.4" />
- <Support is="subgrid" /> [CSS subgrid](https://caniuse.com/?search=Subgrid) <SupportInfo chrome="117" edge="117" firefox="71" safari="16" />

某些特性无法或不好做兼容，但它们影响不大，不使用那些功能即可

- <Support is="docPip" /> [`doc-pip`](/components/doc-pip/): [DocumentPictureInPicture](https://caniuse.com/?search=DocumentPictureInPicture) <SupportInfo chrome="116" edge="116" firefox="no" safari="no" />
- <Support is="highlight" /> [`mentions`](/components/mentions/): [CSS highlight](https://caniuse.com/?search=highlight) <SupportInfo chrome="105" edge="105" firefox="132" safari="17.2" />
- <Support is="overflowClipMargin" /> [`input`](/components/input/#轮播标签): [CSS overflow-clip-margin](https://caniuse.com/?search=overflow-clip-margin) <SupportInfo chrome="90" edge="90" firefox="102" safari="no" />

<script setup>
  import { inBrowser } from '@lun-web/utils';
  const browserInfo = inBrowser ? navigator.userAgent : '';
</script>
