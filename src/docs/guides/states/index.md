---
title: 匹配元素自定义状态
lang: zh-CN
---

有时，我们需要对特定状态的元素自定义样式。例如，我们可能需要修改处于勾选状态的 radio 的样式，我们可能会想到如下代码

```css
l-radio::part(root).is-checked {
  color: red;
}
```

但实际上，我们并不能在`::part`伪元素基础上添加其他的选择器，不能如此做的原因和讨论可参考[这个](https://github.com/w3c/csswg-drafts/issues/3431)。由于勾选状态在元素内部控制，我们只能通过在外面添加额外的属性来选中这个节点并进一步选中里面的内容

不过，W3C 引入了一个新的东西[`CustomStateSet`](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet)以帮助我们选择特定状态的自定义元素。这由 Chromium 率先支持，其最先支持的语法为

```css
l-radio:--checked::part(root) {
  color: red;
}
```

但标准统一的语法为

```css
l-radio:state(checked)::part(root) {
  color: red;
}
```

关于该特性其他文档可参考[这个](https://github.com/whatwg/html/pull/8467)

Chrome现已支持标准语法，各浏览器的支持情况为：<SupportInfo chrome="125" edge="125" firefox="126" safari="17.4" style="padding-left: 0; margin-top: 16px;" /> 详见[Can I Use](<https://caniuse.com/?search=%3Astate()>)

总的来说，这个特性还无法用于生产环境，目前组件库内部进行了适配，若支持该特性则会为组件添加自定义状态，并且额外添加'--'前缀来适配老版本的 Chromium；如果不支持则选择在元素上添加 data 属性来达到类似的效果，如`data-checked`（该特性由`reflectStateToAttr`全局配置控制，你也可以设置为`always`使之总是添加 data 属性）

因此，你可以通过以下CSS来实现类似效果
```css
l-radio[data-checked]::part(root) {
  color: red;
}
/* 加上下面这个以适应未来 */
l-radio:state(checked)::part(root) {
  color: red;
}
```

每个元素支持的 state 未来会在文档上标明，也可以在控制台自行查看，shadowRoot 下根元素大部分带有`is-`的 class 均会反射到自定义状态上
