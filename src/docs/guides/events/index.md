---
title: 监听事件
lang: zh-CN
---

## 事件名格式

由于各大框架对于事件名的格式支持不同，因此本组件库支持自定义派发事件的格式

通过`GlobalStaticConfig.eventNameStyle`可以自定义事件名的格式，其可以为字符串或数组，若为数组则派发事件时依次派发数组里的所有格式，支持的格式如下

```ts
export type EventNameStyle = 'kebab' | 'camel' | 'pascal' | 'lower' | 'upper';
// kebab: valid-click
// camel: validClick
// pascal: ValidClick
// lower: validclick
// upper: VALIDCLICK
```

`eventNameStyle`的默认值为`['kebab', 'camel', 'pascal']`，即默认支持连线格式、驼峰格式和帕斯卡格式的事件名，以 Button 为例，对于`validClick`事件，你可以通过以下三种方式监听

```js
button.addEventListener('valid-click', () => {});
button.addEventListener('validClick', () => {});
button.addEventListener('ValidClick', () => {});
```

根据不同的框架以及你自己的偏好，你可以自行设置所需的格式以减少派发事件的数量。如果是 React，你可能只需`pascal`格式，如果是 Vue，你可能需要`kebab`和`camel`格式

:::warning 注
对于`@lun-web/react`来说，如果是 React19 之前的版本，那么只支持`pascal`格式，如果是 React19，各种格式都支持，但提供的组件 TS 类型只有`pascal`格式
:::

## 事件初始化参数

派发的事件均为`CustomEvent`，通过`event.detail`可获取传递的数据（如果有的话）

事件的其他参数均为默认，也就是`bubbles: false, cancelable: false, composed: false`，**默认不冒泡， 不可取消，不会穿越 Shadow DOM 边界**

如果需要修改，可通过`GlobalStaticConfig.eventInitMap`进行配置，支持配置每个组件所有事件的默认参数，或某个事件的默认参数

```js
// 如果是对象，则该组件所有事件使用这个对象初始化
GlobalStaticConfig.eventInitMap.button = {
  bubbles: true,
  cancelable: true,
  composed: true,
};
// 如果是数组，第一个对象用于所有对象初始化，第二个对象用于指定某个事件的初始化
GlobalStaticConfig.eventInitMap.button = [
  {
    bubbles: true,
  },
  {
    // key必须为驼峰格式
    validClick: {
      composed: true,
    },
  },
];

// 也可以针对所有组件设置相同的
GlobalStaticConfig.eventInitMap.common = {};
GlobalStaticConfig.eventInitMap.common = [];
```

:::warning 注
目前所有事件都不可取消，即使你设置了`cancelable: true`并调用了`event.preventDefault()`，也不会有任何效果。毕竟对于很多事件来说，其只是起到一个通知的作用，并没有什么默认行为，而且有些组件偏向于使用函数回调来处理（例如`beforeOpen`），而不是检测`open`事件是否被取消了。

将来可能有变动，我认为至少`update`事件是可以考虑添加取消功能的
:::
