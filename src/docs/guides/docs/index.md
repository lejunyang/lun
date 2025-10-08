---
title: 文档使用说明
lang: zh-CN
---

## 组件示例

每个组件的文档中都含有多个如下的示例

<!-- @Code:basic -->

- 点击右下角的按钮可以查看示例的源代码并编辑，**代码会实时编译并渲染到页面上**
- 左下角可以选择语言，目前支持 Vue TSX, React TSX 和 HTML，对于各个语言，编写的代码有如下要求

  - Vue: 需要 export default 一个 Vnode 或 Vue 组件，例如
    ```tsx
    export default <div />
    export default () => <><button /></>
    import { defineComponent } from 'vue'
    export default defineComponent({})
    ```
  - React: 需要 export default 一个 ReactElement 或 React 组件，例如
    ```tsx
    export default <div />
    import { useState } from 'react'
    export default () => {
      const [count, setCount] = useState(0)
      return <div>{count}</div>
    }
    ```
  - HTML：纯 HTML 字符串，注意 custom element 必须有闭合标签，不允许自闭合

  绝大部分示例都只编写了 vue 的版本，没时间.jpg

- 编写的代码允许import ESM模块，内置的模块会直接引入（包括`vue`, `react`, `react-dom`, `react-dom/client`, `@lun-web/components`, `@lun-web/core`, `@lun-web/utils`, `@lun-web/react`, `data`）, 其他未知的模块会使用`https://esm.run/${moduleName}`引入，你也可以直接import ESM的CDN URL


```tsx
import { ref } from 'vue';
import lodash from 'lodash-es'; // 会改为import lodash from 'https://esm.run/lodash-es';
import d3 from 'https://esm.run/d3@7.8.3'; // 会直接import该URL

export default <div />
```

- 如果你需要编写样式作用于该代码块，你可以在代码顶层调用`applyStyle(style: string)`，试试在上面的示例中添加以下代码

```ts
applyStyle(`.example-text { color: var(--l-accent-9) }`);
```

该函数会根据浏览器支持情况向页面中添加`@scope`, `@container`或`@layer`样式，以此限定在该代码块内，若均不支持则直接添加样式。该函数仅能调用一次，后调用的覆盖之前的样式，HTML 中不可用，因为只能写字符串，HTML 中你可以自行添加`<style>@scope {}</style>`

## 文档贡献

文档存放于`src/docs`目录下，每篇文档都由一个包含`index.md`的文件夹组成，这个文件夹的路径即为 url 路径。在这个文件夹中，每个不同语言的代码示例都有分别放置在不同的文件中，它们必须使用同一文件名加不同后缀以便于区分。

以 button 的文档为例，`src/components/button`下

- `basicUsage.vue.tsx` 代表 Vue TSX 示例
- `basicUsage.react.tsx` 代表 React 示例
- `basicUsage.html` 代表 HTML 示例

然后在 `index.md` 中，我们需要以`<!-- @Code:basicUsage -->`注释来引入这些示例。

注意，**必须编写 Vue 的代码示例**。由于 babel 及依赖加载需要时间，为避免明显的白屏时间，内部会直接引入这些 Vue 的代码示例并展示它们。当 babel 和依赖加载完毕后，若用户修改源代码或切换示例语言，便渲染动态生成的用例
