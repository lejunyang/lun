---
title: 集合
lang: zh-CN
---

## intersectionOfSets

```ts
function intersectionOfSets(set1: Set<any>, set2: Set<any>): Set<any>
```

获取两个集合的交集，当支持`Set.prototype.intersection`时，使用原生方法，否则回退到polyfill

:::warning 注
polyfill是创建一个新的集合，遍历数量较小的那个集合来获取交集，而原生是直接调用第一个set的方法。如果你的第一个set使用了Proxy拦截，polyfill和原生实现将可能有区别

目前在Vue中能显著观察到该问题，当第一个set被ref代理后，且当前浏览器支持`Set.prototype.intersection`，由于Vue暂不支持该方法，调用原生方法将报错，而polyfill正常工作

此问题在以下几个set方法中同样存在
:::

## differenceOfSets

获取两个集合的差集，当支持`Set.prototype.difference`时，使用原生方法，否则回退到polyfill。差集以第一个参数为主，即在第一个集合中而不在第二个集合中的元素

## unionOfSets

获取两个集合的并集，当支持`Set.prototype.union`时，使用原生方法，否则回退到polyfill