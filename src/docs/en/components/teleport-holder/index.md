<!--this file is copied from chinese md, remove this comment to update it, or it will be overwritten when next build-->
---
title: TeleportHolder 传送门
lang: zh-CN
---

对于某些需要`Teleport`的组件（如`message`, `popover`, `select`等），如果它们直接往 body 渲染节点，则无法使用组件本身 shadowRoot 下的样式。而`teleport-holder`便相当于一个容器，为这些组件的节点提供存放位置并提供样式

- 该组件为内部自动创建使用，每个有`Teleport`的组件都会有一个`to`属性，若不指定则默认创建到第一个`theme-provider`元素下

```ts
type Props = {
  to?: MaybeRefLikeOrGetter<string | HTMLElement>;
};
```

- 被 Teleported 的内容会被特殊处理，其仍然会继承原先所在位置的状态，例如 EditState、主题等等
- 其默认为 fixed 定位，`z-index`可在`GlobalContextConfig`中配置
- 对于那些被 Teleport 的组件，`teleport-holder`只提供了它们在全局静态/动态配置中的样式，它们原节点本身的`innerStyle`无法生效
- 需要注意的是，被 Teleport 的节点如果包含 slot，则**该组件的这个插槽将无法使用**，具体有哪些请参考各个组件(例如 popover 的 pop-content 插槽)

## 继承

<!-- @Code:inherit -->
