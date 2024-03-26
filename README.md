# Web components based on Vue3

- Based on custom elements ([Vue3 defineCustomElement](https://vuejs.org/guide/extras/web-components.html)) and shadow DOM, works with all frameworks
- Provides abundant global static and dynamic configurations, easy to customize not only CSS but also many internal behaviors
- Provides a beautiful preset theme based on @radix/theme, out-of-box dark mode and responsive ui support
- Attempt to use new Web APIs like Popover API, getComposedRanges, showOpenFilePicker, etc.

## Why

There are plenty of powerful web libraries, why creating new one?

Well, mainly for personal learning and summary. I'm interested in cross-framework library as we could have great and unified DX in different frameworks with it. Shadow DOM is an option, but obviously it's not that convenient. It's complicate on customizing CSS, hard to manage its children nodes, no dynamic slots and so on. 

I don't found any library based on shadow DOM that has both useful and out-of-box features and easy customization, maybe it's because of the limitation of shadow DOM. So I decided to think up some ways to make it work.

Why Vue3? Most cross framework libraries use class oriented way to build themselves, I prefer hook and composition way so I chose Vue3's defineCustomElement.

## Development

Requires pnpm to run locally. If there is no local build, run build first.

```
pnpm install
pnpm build
pnpm dev
```
