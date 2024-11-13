---
title: 别名
lang: zh-CN
---

以下工具函数用于帮你快捷调用某些API，相当于取了一个别名，当然也添加了一些实用功能

## on

```ts
import { on } from '@lun-web/utils'

function on<T extends Event>(el: Element | Window | Document | undefined | null, event: string, handler: ((event: T) => void) | {
    handleEvent(object: T): void;
} | EventListenerObject, options?: boolean | AddEventListenerOptions): () => void
```

快捷调用`addEventListener`，传参与其相同。注意其只会检测是否为真值，不会检测是否为Element、Window、Document。

其返回一个函数，用于移除该事件监听。

## off

同上，用于快捷调用`removeEventListener`。

## onOnce

注册只执行一次的事件监听。
