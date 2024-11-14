---
title: Promise
lang: zh-CN
---

## promiseTry

```ts
function promiseTry<F extends AnyFn>(fn: F, ...args: Parameters<F>): Promise<Awaited<ReturnType<F>>>
```

该函数用于执行某一个函数并返回Promise。当传入函数为同步代码时也会同步执行，避免了`Promise.resolve`的问题

当原生支持[`Promise.try`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/try)时直接调用原生实现，否则回退到polyfill。

## withResolvers

```ts
const { promise, resolve, reject } = withResolvers();
```

该函数用于创建一个Promise对象，并获得它的`resolve`和`reject`函数，避免了自己像下面这样手动创建
```js
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});
```
当原生支持[`Promise.withResolvers`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers)时直接调用原生实现，否则回退到polyfill。

相较于原生实现，本函数添加了一些额外内容。为方便重命名返回的变量，`withResolvers`返回的对象为**可迭代对象**，这意味着你可以像下面这样使用数组解构，以便你自己确定变量名

```js
const [promise, resolve, reject] = withResolvers();
```