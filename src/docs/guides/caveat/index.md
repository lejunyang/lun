---
title: 注意事项
lang: zh-CN
---

## 访问组件实例

在某些组件中，我们会将一些实用的方法或属性暴露到 DOM 上，你可能会在组件加载时调用这些方法。但需要注意的是，你**可能需要在组件加载后的下一个微任务才能访问到这些方法或属性**。

以 Vue 为例，在组件的`onMounted`中可能还需要`queueMicrotask`或`Promise.resolve()`才能访问到最内层 DOM 暴露的方法或属性

查看下面的示例代码并打开控制台查看输出，可以看到在`onMounted`我们可以获取到`l-popover`的方法，但是无法获取`l-button`的方法，而下个微任务后就都可以访问到了

这是因为`onMounted`在`l-popover`和`l-button`均加载到页面上后就会执行，而自定义元素加载到页面后还需要一个微任务才能完成组件的setup，`l-popover`由于在外层优先完成了setup，便可以在`onMounted`中访问到它的方法。

<!-- @Code:instance -->
