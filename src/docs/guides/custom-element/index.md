---
title: 简易自定义元素入门
lang: zh-CN
---

## 元素

自定义元素继承自`HTMLElement`，其需要手动调用[`customElements.define`](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define)来注册，注册后便能在 HTML 中使用该元素。

`@lun-web/components`中提供的 define 函数便是帮助我们快速注册组件，以按钮为例，当调用`defineButton()`后，我们便能在 HTML 中使用`<l-button>`标签来使用按钮组件。

<l-button>按钮</l-button>

你可以现在打开控制台查看上面的按钮元素，你可以看到如下结构：

```html
<l-button>
  #shadow-root (open)
    <button>...</button>
  按钮
</l-button>
```

其中`#shadow-root`里面是组件的实际渲染内容，其被称为 Shadow DOM，是自定义元素提供的特性。其提供了良好的封装性，外部的样式无法轻易影响到 Shadow DOM，内部的样式也无法影响外部

## 属性

自定义元素定义了一系列属性，这些属性全部可以通过元素本身去设置

```js
const button = document.querySelector('l-button');
button.disabled = true;
button.size = 3;
button.asyncHandler = () => {};
```

如果要设置的属性是原始值（字符串、数字、布尔值），我们也可以通过 Attribute 去设置。注意对于布尔属性来说，属性存在时值为 true，不存在时值为 false。

```js
const button = document.querySelector('l-button');
button.setAttribute('size', '3');
button.removeAttribute('disabled');
```

现代框架都会智能判断是往 Property 设置还是往 Attribute 设置，使用时按照一般组件使用即可


## 事件

自定义元素派发的事件通过`addEventListener`来监听，现代框架都可以智能添加事件处理，我们只需要使用`onXXX`监听事件即可，不过不同框架支持的格式不同，你可能需要更改全局配置，具体可见[绑定事件](/guides/events/)

## 插槽

我们可以在组件的Shadow DOM中看到`<slot>`元素，这就是组件的插槽：
- 若其有`name`属性，则其为具名插槽，自定义元素的子元素拥有相同`slot`属性的元素会被渲染该具名插槽中（例如下面按钮示例中的`span`元素和`icon`插槽）
- 若其没有`name`属性，则其为默认插槽，自定义元素中没有指定`slot`的子节点都会视为渲染到该插槽位置（例如下面按钮示例中的“按钮”文本）

<l-button><span slot="icon">+</span>按钮</l-button>

不同的元素根据不同的功能会拥有多个插槽，目前文档没有列出，以后会详细列出。