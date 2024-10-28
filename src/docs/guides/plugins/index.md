---
title: 插件
lang: zh-CN
---

`@lun-web/plugins`提供了一些 Vue 自定义指令，目前有以下两个

## v-content

该指令用于在某些情况下替代`v-show`以获得更好的性能，使用方式与`v-show`相同，其使用`content-visibility: hidden;`来隐藏元素，隐藏时浏览器会缓存渲染状态，在频繁切换显示状态时能获得巨大的性能提升。我在[content-visibility](https://developer.mozilla.org/en-US/docs/Web/CSS/content-visibility)页面中使用以下脚本测试 main 元素的显示隐藏，二十轮下有十倍的性能差距，如果测试方法有误，欢迎提出

```js
function test(el, isContentVisibility, round = 20, usedTime = 0) {
  if (!round) {
    console.log('test end', usedTime);
    return;
  }
  const prop = isContentVisibility ? 'contentVisibility' : 'display',
    value = isContentVisibility ? 'hidden' : 'none';
  const start = performance.now();
  el.style[prop] = value;
  el.offsetHeight; // force reflow
  el.style[prop] = '';
  el.offsetHeight;
  const end = performance.now();
  console.log('round', round, end - start);
  setTimeout(() => {
    test(el, isContentVisibility, round - 1, usedTime + (end - start));
  }, 50);
}

// 56.10000001639128
// 615.8999999761581
```

由于该属性较新，在浏览器不支持的情况下，该指令会切换到`display: none`来隐藏元素，目前主流浏览器均已支持该特性
<Support is="content" /> [CSS content-visibility](https://caniuse.com/?search=content-visibility) <SupportInfo chrome="85" edge="85" firefox="125" safari="18" />

其如同`v-show`一样，也支持 Vue 的`Transition`和`TransitionGroup`组件，可以用于实现元素的过渡动画

不过需要注意的是，**该指令不能用于无脑替换`v-show`**。即使标准文档说了它与`display: none`相似，但还是有本质区别。`display: none`是元素本身及其子元素完全不渲染，而`content-visibility: hidden`是子节点跳过渲染，元素本身仍然存在盒模型，只不过应用了一些样式限制。当这个元素自己设置了宽高、padding 等样式时它仍会占用空间，于是你仍然能看到一个空的元素。如果该元素是由子元素撑开，则与`display: none`表现相同，所以使用时你需要注意一下，在元素本身存在大小设置时，你可以将`v-content`放到它父元素上。不过在flex或grid容器中，使用了`content-visibility: hidden`的子元素仍然会占用一个位置，导致gap显示异常，这种情况下还是建议直接使用`v-show`

另外还有一个注意点是，元素内联 style 里的`content-visibility`或`display`可能会覆盖它设置的值，对于`v-show`，Vue 在其内部处理了这个逻辑，而`v-content`无法干预。`v-content`也没有处理 SSR 逻辑，因为 SSR 情况下无法判断客户端是否支持`content-visibility`属性，元素会在激活时才设置 style

## v-update

这是专门给`@lun-web/components`用的，用于同步输入组件的更新

Vue 不支持在自定义元素上使用`v-model`，无法自定义那个逻辑。虽然有比较 hack 的方法，但是 vue 编译器会检测 v-model，如果在自定义元素上使用会直接报错。。。还是算了

`@lun-web/components`输入组件的更新事件均为`update`，这是为了与原生事件名区分，所以取名没有取名`input`、`change`等等。

有些组件是使用`value`属性，有些是使用`checked`、`open`等等，而且`update`事件的参数也各不相同，该指令会进行以下转换：

`v-update-TARGET:FROM={EXPR}` => `TARGET={EXPR} onUpdate={(e) => EXPR = e.detail.FROM}`

`TARGET`指的是元素要设置的值，`FROM`指的是事件里值的来源，`TARGET`和`FROM`都是可选, `TARGET`默认为 `value`, `FROM`没有默认值，那么 onUpdate 里面就是`EXPR = e.detail`

有可能未来会自动检测，但目前只能根据不同组件去不同设置

部分转换示例如下：

```jsx
<l-input v-update={target.value} /> // before
<l-input value={target.value} onUpdate={(e) => target.value = e.detail} /> // after

<l-select multiple v-update:raw={target.value} /> // before
<l-select multiple value={target.value} onUpdate={(e) => { target.value = e.detail.raw }} /> // after

<l-checkbox v-update-checked:checked={target.value} /> // before
<l-select checked={target.value} onUpdate={(e) => { target.value = e.detail.checked }} /> // after
```

该指令支持 vue template 和 vue babel jsx，需要从不同的来源导入并配置到项目中，以vite为例如下所示：

```js
import { vUpdate as vUpdateForBabel } from '@lun-web/plugins/babel';
import { vUpdate as vUpdateForTemplate } from '@lun-web/plugins/vue';
import vuePlugin from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

export default defineConfig({
  plugins: [
    vuePlugin({
      template: {
        compilerOptions: {
          nodeTransforms: [vUpdateForTemplate],
        },
      },
    }),
    vueJsx({
      babelPlugins: [vUpdateForBabel],
    }),
  ],
});
```
