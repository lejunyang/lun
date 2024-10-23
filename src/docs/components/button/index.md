---
title: Button 按钮
lang: zh-CN
---

<CompThemePanel comp="button" includeContrast includeDisabled :other="{ label: 'button' }" />

## 基本使用

按钮里的内容由子节点（默认插槽）或`label`属性决定，子节点的优先级更高

<!-- @Code:basicUsage -->

## 异步函数自动 loading

<!-- @Code:autoLoading -->

## 按住模式

通过设置`hold`可使按钮变为按住模式，单位为毫秒

按住模式下，需要按住按钮直至设定的时间才会触发点击事件，适用于需要用户小心确认的情况

<!-- @Code:holdOnMode -->

:::warning 注
使用按住模式，防抖，节流等功能时，你需要通过监听`valid-click`事件或者设置`asyncHandler`来触发回调，而不是监听`click`事件，`click`事件每次点击都会触发
:::

## 防抖和节流

<!-- @Code:debounce -->

## 倒计时

`l-button`DOM 上有`setTimeout`方法，可用于快速设置一个倒计时，倒计时期间按钮进入loading状态，这通常用于点击冷却的场景（如验证码）。单位为毫秒，默认文本刷新间隔为 1s

```ts
setTimeout(timeout: number, getCountdownTxt?: (remain: number) => string, interval?: number): void;
clearTimeout(): void;
```

当处于倒计时状态时会显示倒计时文本，倒计时文本是否显示受`showLoading`属性影响，其位置受`iconPosition`影响。如果原先就处于 loading 状态，则会优先展示 loading 文本而不是 spin

<!-- @Code:countdown -->

## 复制文本

通过`copyText`属性可以便捷地添加点击复制功能

<!-- @Code:copyText -->

## 块级按钮

<!-- @Code:block -->

## 不同大小

<!-- @Code:differentSizes -->

<!-- @Code:_devWithIcons -->
