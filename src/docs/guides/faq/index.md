---
title: FAQ & Roadmap
lang: zh-CN
---

## FAQ

### 为什么引入 Vue 运行时？

为了良好的开发体验，适当的运行时是必要的。Vue 本身有提供自定义元素的支持，再加上我也喜欢组合式开发，不喜欢 class 那种方式，所以选择了 Vue。如果你的项目本身没有使用 Vue，只要用的组件数量足够多，Vue 的运行时并不会是一个负担

### 市面上那么多组件库，为什么还要花费精力去造个新轮子？

市面上的非 Web Components 组件库基本是靠单独适配来给不同的框架使用的，而现有的 Web Components 库功能和自定义性可以说堪称贫瘠，我没有找到一个符合我要求，美观又好用的，那就再造一个喽，所以我直接造一个取名为 Lun（轮）

### Vue2 可以用吗？

可以，因为 Web Components 本身的特性是框架无关的，但是需要 Vue2 和 Vue3 在一个项目共存，需要些配置。如果是vite，可参考[Lun Vue2 Start - StackBlitz](https://stackblitz.com/edit/lun-vue2-start?file=vite.config.js,src%2FApp.vue,package.json)的配置，需要在 package.json 重命名来一个安装 vue3，然后通过rollup的自定义解析，将组件库内的vue导入定向到 vue3，这样就不会影响项目里原来的 vue2。webpack等有空再研究怎么配置

## Roadmap

- 稳定当前已有的组件，还有不少组件标了高度实验中，有待修复问题
- 添加测试用例
- 完善文档，提供组件的Props、Events、Slots、Methods等详细说明
- 添加其他想实现但没时间做的组件或功能
  - 稳定Form的实现，稳定表单校验、值转换等功能
  - 为组件库的Select、Tree集成内部的虚拟渲染，同时支持外部虚拟渲染
  - 让ScrollView提供更完善的滚动驱动动画
  - 实现Table
  - Input掩码，简化Input渲染
  - 添加颜色处理预设，完善ColorPicker
  - 大单元格Calendar渲染，完善模式切换，添加日历事件支持，农历支持
  - 完善组件Transition
  - 添加菜单组件
- Accessibility 支持
- 收集社区意见，确定组件的功能，属性方法命名是否需要修改
- 英文翻译