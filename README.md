# Web components based on Vue3

- Based on custom elements ([Vue3 defineCustomElement](https://vuejs.org/guide/extras/web-components.html)) and shadow DOM, works with all frameworks(maybe)
- Provides abundant global static and dynamic configurations, easy to customize not only CSS but also many internal behaviors
- Provides a beautiful preset theme based on @radix/theme, out-of-box dark mode and responsive ui support


## Why

There are plenty of powerful web libraries, why creating new one?

Well, mainly for personal learning and summary. I'm also interested in cross-framework library, but I don't found any library based on shadow DOM that has lots of useful and out-of-box features like antd. 

We could have great and unified DX in different frameworks with shadow DOM. But obviously shadow DOM is not that convenient, it's complicate on customizing CSS, hard to manage its children nodes, no dynamic slots. I've brought a few ways to solve that, but I don't know if they're elegant or efficient, still a lot of work to do.

## Development

Requires pnpm to run locally. If there is no local build, run build first.

```
pnpm install
pnpm build
pnpm dev
```