---
title: Tour 引导
lang: zh-CN
---

## 基本使用

通过`steps`属性设置 Step 数组即可使用，Step 的类型如下

```ts
type TourStep = {
  title?: string;
  content?: string;
  target?: MaybeRefLikeOrGetter<string | Element | VirtualElement>;
  beforeEnter?: () => MaybePromise<boolean | void>;
  scrollOptions?: ScrollIntoViewOptions;
};
```

`target`属性可以是选择器、元素或虚拟元素，当`target`属性存在且其为元素时，Tour 会自动将目标元素滚动到可视区域；若`target`不存在，则会定位到屏幕中心

`beforeEnter`可以用于在进入该步骤前异步处理任务，若返回 false 则不会进入该步骤

<!-- @Code:basicUsage -->

## 使用插槽

使用插槽可自行渲染一些内容，其优先级比`steps`高。`content`插槽的名称为当前 step 的 index

<!-- @Code:contentSlot -->

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->