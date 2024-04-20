---
title: TeleportHolder 传送门
lang: zh-CN
---

对于某些需要`Teleport`的组件（如`message`, `popover`, `select`等），如果它们直接往 body 渲染节点，则无法使用组件本身 shadowRoot 下的样式。而`teleport-holder`便相当于一个容器，为这些组件的节点提供存放位置并提供样式

- 该组件为内部自动创建使用，每个有`Teleport`的组件都会有一个`to`属性，若不指定则默认创建到第一个`theme-provider`元素下。某些情况下这种行为可能会导致样式差异，比如嵌套的`theme-provider`需要自行指定渲染位置
```ts
type Props = {
  to?: MaybeRefLikeOrGetter<string | HTMLElement>
}
```
- 其默认为 fixed 定位，`z-index`可在`GlobalContextConfig`中配置
- 对于那些被Teleport的组件，`teleport-holder`只提供了它们在全局静态/动态配置中的样式，它们原节点本身的`innerStyle`无法生效
- 需要注意的是，被Teleport的节点如果包含slot，则**该组件的这个插槽将无法使用**，具体有哪些请参考各个组件。但是某些组件可能针对插槽做了特殊处理，例如`popover`在被Teleport时仍可以使用插槽，但这是以克隆所有节点加MutationObserver的方式实现的，并且还需要浏览器支持HTMLSlotElement.assign，所以这种情况尽可能不要再使用插槽了
