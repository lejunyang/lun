---
title: 时间函数
lang: zh-CN
---

## debounce

```ts
function debounce<T extends (...args: any[]) => any>(func: T, wait?: number | string, options?: {
    leading?: boolean;
    trailing?: boolean;
    maxWait?: number | string;
    onSchedulingUpdate?: (isScheduling: boolean) => void;
}): T & {
  flush(): ReturnType<T> | undefined;
  cancel(): void;
  isScheduling(): boolean;
}
```

## throttle

## delay

```ts
function delay(ms: number): Promise<void>;
```

返回一个 Promise，在指定的时间后 resolve。

## raf

```ts
function raf(callback: FrameRequestCallback, frames?: number, shouldCancel?: () => boolean): () => void
```

在特定的帧数后（默认为1）调用回调函数，返回一个函数用于取消它。第三个`shouldCancel`也可以用于阻止回调执行，它会在每一帧进行检查，如果返回真值则取消回调。

## waitFrames

```ts
function waitFrames(frames?: number): Promise<number>
```

返回一个Promise，在指定帧数后resolve

## rafThrottle

```ts
function rafThrottle<T extends (...args: any[]) => any>(func: T, frames?: number, shouldCancel?: () => boolean): T
```

创建一个节流函数，在指定的帧数内不断调用该节流函数，真正的函数只会执行一次