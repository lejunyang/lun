---
title: 监听事件
lang: zh-CN
---

## 监听事件

组件库内的自定义事件会同时派发驼峰格式和连线格式，以Button为例，对于`validClick`事件，你可以通过以下两种方式监听

```js
button.addEventListener('validClick', () => {})
button.addEventListener('valid-click', () => {})
```

派发的事件均为`CustomEvent`，通过`event.detail`可获取传递的数据（如果有的话）。事件的其他参数均为默认，也就是`bubbles: false, cancelable: false, composed: false`，**默认不冒泡， 不可取消，不会穿越 Shadow DOM 边界**。如果需要修改，可通过`GlobalStaticConfig.eventInitMap`进行配置，支持配置每个组件所有事件的默认参数，或某个事件的默认参数

```js
// 如果是对象，则该组件所有事件使用这个对象初始化
GlobalStaticConfig.eventInitMap.button = {
  bubbles: true,
  cancelable: true,
  composed: true
}
// 如果是数组，第一个对象用于所有对象初始化，第二个对象用于指定某个事件的初始化
GlobalStaticConfig.eventInitMap.button = [
  {
    bubbles: true,
  },
  {
    // key必须为驼峰格式
    validClick: {
      composed: true
    }
  }
]

// 也可以针对所有组件设置相同的
GlobalStaticConfig.eventInitMap.common = {}
GlobalStaticConfig.eventInitMap.common = []
```
<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->