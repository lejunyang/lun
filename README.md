# Lun [![Component tests](https://github.com/lejunyang/lun/actions/workflows/test.yml/badge.svg)](https://github.com/lejunyang/lun/actions/workflows/test.yml) [![Codacy Badge](https://app.codacy.com/project/badge/Coverage/751fd91b62944d92a6582bad731d20c8)](https://app.codacy.com/gh/lejunyang/lun/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage) [![NPM Version](https://img.shields.io/npm/v/%40lun-web%2Fcomponents)](https://www.npmjs.com/package/@lun-web/components) [![Components min size](https://badgen.net/bundlephobia/minzip/@lun-web/components)](https://bundlephobia.com/package/@lun-web/components@latest) ![tree-shaking](https://badgen.net/bundlephobia/tree-shaking/@lun-web/components)

**English** | [中文](./README.zh-CN.md)

A full-featured web components library based on Vue3

- Based on custom elements and shadow DOM, **works with all frameworks**
- Well-encapsulated features and few required dependencies(vue and floating-ui), provides a set of high-quality components, relatively lightweight
- Provides abundant global static and dynamic configurations, easy to customize not only CSS but also many internal behaviors
- Styleless or with a beautiful preset theme based on @radix/colors, out-of-box dark mode and responsive ui support
- Ready to use new Web APIs (Popover API, CSS Anchor Positioning CustomStateSet...), provide reasonable fallbacks
- Full typescript support, provide type definitions for all components

## Warning

Not production ready, still in development, you can keep an eye on it. Feel feel to give me any kind of feedback, also contribution is welcome.

## How to use

Please refer to [docs](https://lejunyang.github.io/lun/en/guides/usage/)

English document is not translated yet, only the menus are translated for now

## Development

### Structure

```
packages
  ├── components // components library
  ├── core // hooks for components
  ├── utils // common utils for javascript
  ├── theme // theme package
  ├── plugins // babel and vue plugins for custom vue directives
  ├── react // components library specially for react before react19
src // docs
utils // utils for this workspace
```

Requires node>=20 and pnpm>=9.5.0 to run locally. If there is no local build, run build first.

```
pnpm install
pnpm build
pnpm dev

pnpm exec playwright install # if you want to run e2e tests
pnpm test
```

## FAQ & Roadmap

### Why Vue3

I'm convinced by [Vue3 defineCustomElement](https://vuejs.org/guide/extras/web-components.html), a proper runtime is necessary for better DX.
Also, most cross framework libraries use class oriented way to build themselves, I prefer hook and composition way so I chose Vue3's defineCustomElement. It's good trade-off if you use amounts of components

### Why another library?

There are plenty of powerful web libraries, why creating new one?

Well, mainly for personal learning and summary. I'm interested in cross-framework library as we could have great and unified DX in different frameworks with it. Shadow DOM is an option, but obviously it's not that convenient. It's complicate on customizing CSS, hard to manage its children nodes, no dynamic slots and so on.

I don't found any library based on shadow DOM that has both useful and out-of-box features and easy customization, maybe it's because of the limitation of shadow DOM. So I decided to think up some ways to make it work.

### Could it be used in Vue2?

Technically yes, because web components is not framework-specific, but you need to handle the import from vue2 and vue3 properly. Definitely needs some configurations in different CLI, haven't tested yet.

### Roadmap

- fix bugs, remove experimental flags, complete their features
  - Tree
  - VirtualRenderer
  - Calendar、DatePicker
  - ScrollView
  - Mentions
  - Tabs
  - Accordion
  - DocPip
- add test cases
- add docs about Props, Events, Slots, Methods for components
- features I want to add but haven't got time yet:
  - some Form functions
  - integrate internal virtual rendering for Select、Tree, support external virtual rendering
  - provide better scroll-driven animation usage in ScrollView
  - implement Table
  - input mask feature, simplify input rendering
  - add color process preset, finish ColorPicker
  - finish Calendar
  - unify which one take precedence, prop or slot
  - controlled mode or uncontrolled mode for some components
  - finalize component Transition(css or config?)
  - add some other components
- accessibility support
- gather feedback, finalize name and functions of components
- Docs translation
