# Lun [![Component tests](https://github.com/lejunyang/lun/actions/workflows/test.yml/badge.svg)](https://github.com/lejunyang/lun/actions/workflows/test.yml) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/751fd91b62944d92a6582bad731d20c8)](https://app.codacy.com/gh/lejunyang/lun/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage) [![NPM Version](https://img.shields.io/npm/v/%40lun-web%2Fcomponents)](<(https://www.npmjs.com/package/@lun-web/components)>) [![Components min size](https://badgen.net/bundlephobia/minzip/@lun-web/components)](https://bundlephobia.com/package/@lun-web/components@latest) ![tree-shaking](https://badgen.net/bundlephobia/tree-shaking/@lun-web/components)

**中文** | [English](./README.md)

基于 Vue3 的跨框架 Web 组件库

- 基于自定义元素和 Shadow DOM，**兼容现代 web 环境和所有框架**
- 封装良好，功能丰富，提供了一套高质量的组件，仅 Vue3 和 floating-ui 为必须依赖，体积相对较小
- 提供了丰富的全局静态和动态配置，可灵活自定义内部各种行为和组件样式
- 支持无头模式，也提供一套基于@radix/colors 定制的主题，开箱即用的暗黑模式，丰富的色彩与变体，支持响应式
- 致力于使用各种全新 Web API（如 Popover API，CSS Anchor Positioning， CustomStateSet...），提供优雅的回退
- 提供完整的 Typescript 支持，提供 Vue 和 React 组件类型定义

## 警告

还在开发中，还没有发布正式版本，请谨慎使用。欢迎提供任何反馈，也欢迎贡献代码(如有兴趣，欢迎联系我提供指南与讲解)

## 如何使用

请参考[文档](https://lejunyang.github.io/lun/guides/usage/)

## 开发

可使用[CodeSandbox](https://codesandbox.io/p/github/lejunyang/lun/main)来快速尝试线上开发

### 目录结构

```
packages
  ├── components // 组件库
  ├── core // 为组件提供的hooks
  ├── utils // js公用的utils
  ├── theme // 主题库
  ├── plugins // babel and vue插件，提供vue自定义指令
  ├── react // 为react19之前的版本提供的兼容
src // 文档
utils // 构建utils
```

本地运行需要 node>=20 以及 pnpm>=9.9.0，如果本地没有构建过，需要先运行一次 build

```
pnpm install
pnpm build
pnpm dev

pnpm exec playwright install # if you want to run e2e tests
pnpm test
```

## FAQ & Roadmap

### 为什么引入 Vue 运行时？

为了良好的开发和使用体验，适当的运行时是必要的。Vue 本身有提供很多功能支持，给自定义元素带来了很多便利，再加上我也喜欢组合式开发，不喜欢 class 那种方式，所以选择了 Vue。如果你的项目本身没有使用 Vue，只要用的组件数量足够多，Vue 的运行时并不会是一个负担

### 市面上那么多组件库，为什么还要花费精力去造个新轮子？

主要是为了个人学习总结，我个人对 Web Components 也非常感兴趣，毕竟跨框架使用可以带来统一的体验

市面上的非 Web Components 组件库基本是靠单独适配来给不同的框架使用的，而现有的 Web Components 组件库功能和自定义性可以说堪称贫瘠，我没有找到一个符合我要求，美观又好用的，那就再造一个喽，所以我直接取名为 Lun（轮）

### Vue2 可以用吗？

理论上可以，因为 Web Components 本身的特性是框架无关的，但是需要 Vue2 和 Vue3 在一个项目共存，需要些配置，暂未测试

### 小程序可以用吗？

不可以，小程序并非标准 Web 环境，海量 Web 特性小程序都不支持

### Roadmap

- 稳定当前已有的组件，还有不少组件标了高度实验中，有待修复问题
  - Table
  - Form
  - Tree
  - VirtualRenderer
  - Calendar、DatePicker
  - ScrollView
  - Mentions
  - Tabs
  - Accordion
  - DocPip
- 添加测试用例
- 完善文档，提供组件的 Props、Events、Slots、Methods 等详细说明
- 添加其他想实现但没时间做的组件或功能
  - slot 与 prop 优先级统一，目前各个组件有些不同
  - 确定输入组件的受控模式，目前不统一。确定某些更新事件是否可取消
  - 组件 Transition 方案确定，目前全在 common css 里，可能考虑迁移到全局配置，放 js 中
  - 为 Select、Tree 集成内部的虚拟渲染，同时支持外部虚拟渲染
  - Input 掩码输入，Input hint 及 tab 补全，分组 Input 输入，简化 Input 渲染
  - 添加颜色处理预设，完善 ColorPicker
  - 大单元格 Calendar 渲染，完善模式切换，添加日历事件支持，农历支持
  - 其他想实现的...
- Accessibility 支持
- 收集社区意见，确定组件的功能，属性方法命名是否需要修改
- 英文翻译
