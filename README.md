# Lun

A web components library based on Vue3

- Based on custom elements and shadow DOM, works with all frameworks
- Well-encapsulated features and few required dependencies(vue and floating-ui), provides a set of high-quality components, relatively lightweight
- Provides abundant global static and dynamic configurations, easy to customize not only CSS but also many internal behaviors
- Styleless or with a beautiful preset theme based on @radix/theme, out-of-box dark mode and responsive ui support
- Ready to use new Web APIs (Popover API, CSS Anchor Positioning, File System Access API...), provide reasonable fallbacks

## Warning

Not production ready, still in development.

## How to use

Please refer to [docs](https://lejunyang.github.io/lun/guides/usage/)

## Why

There are plenty of powerful web libraries, why creating new one?

Well, mainly for personal learning and summary. I'm interested in cross-framework library as we could have great and unified DX in different frameworks with it. Shadow DOM is an option, but obviously it's not that convenient. It's complicate on customizing CSS, hard to manage its children nodes, no dynamic slots and so on.

I don't found any library based on shadow DOM that has both useful and out-of-box features and easy customization, maybe it's because of the limitation of shadow DOM. So I decided to think up some ways to make it work.

### Why Vue3

I'm convinced by [Vue3 defineCustomElement](https://vuejs.org/guide/extras/web-components.html)
Also, most cross framework libraries use class oriented way to build themselves, I prefer hook and composition way so I chose Vue3's defineCustomElement. Though we have to have a vue runtime to use it, it's good trade-off if we use amounts of components

## Development

Requires pnpm>=9.5.0 to run locally. If there is no local build, run build first.

```
pnpm install
pnpm build
pnpm dev
```
