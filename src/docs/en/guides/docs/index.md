---
title: 文档使用说明
lang: zh-CN
---

## 组件示例

每个组件的文档中都含有多个如下的示例

<!-- @Code:basic -->

- 点击右下角的按钮可以查看示例的源代码并编辑，**代码会实时编译并渲染到页面上**
- 左下角可以选择语言，目前支持 Vue TSX, React TSX 和 HTML，对于各个语言，编写的代码有如下要求
  - Vue: 需要 export default 一个 Vnode 或 Vue组件
  - React: 需要 export default 一个 ReactElement 或 React函数组件
  - HTML：纯 HTML 字符串，注意 custom element 必须有闭合标签，不允许自闭合
- 编写的代码中仅允许特定的import，分别为`vue`, `react`, `react-dom`, `react-dom/client`, `@lun-web/components`, `@lun-web/core`, `@lun-web/utils`, `@lun-web/react`, `data`, import其他内容会直接报错

绝大部分示例都只编写了 vue 的版本，没时间.jpg

## 文档贡献

文档存放于`src/docs`目录下，每篇文档都由一个包含`index.md`的文件夹组成，这个文件夹的路径即为 url 路径。在这个文件夹中，每个不同语言的代码示例都有分别放置在不同的文件中，它们必须使用同一文件名加不同后缀以便于区分。

以button的文档为例，`src/components/button`下
- `basicUsage.vue.tsx` 代表 Vue TSX 示例
- `basicUsage.react.tsx` 代表 React 示例
- `basicUsage.html` 代表 HTML 示例

然后在 `index.md` 中，我们需要以`<!-- @Code:basicUsage -->`注释来引入这些示例。

注意，**必须编写Vue的代码示例**。由于esbuild加载需要时间，为避免明显的白屏时间，内部会直接引入这些Vue的代码示例并展示它们。当esbuild加载完毕后，若用户修改源代码或切换示例语言，便渲染动态生成的用例

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->