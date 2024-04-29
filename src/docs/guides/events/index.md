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

派发的事件均为`CustomEvent`，**不会冒泡**，通过`event.detail`可获取传递的数据（如果有的话）。