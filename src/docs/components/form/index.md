---
title: Form 表单
lang: zh-CN
---

## 所有表单组件

<!-- @Code:allComponents -->

## 校验

<!-- @Code:validate -->

## 依赖字段

通过`deps`属性可设置该字段依赖的其他字段，其值为其他字段的name字符串或name数组。当其依赖字段的值发生变化后，可自动控制该字段清除、禁用、必输、校验，具体可通过以下属性进行控制

- `clearWhenDepChange`: 当其为`true`时，依赖字段的值变化后，本字段值清空
- `disableWhenDepFalsy`: 控制当依赖的字段值什么情况下本字段禁用，可选值有：
  - `all`: 当依赖的所有字段值为falsy时，本字段禁用
  - `some`: 当依赖的所有字段值中有部分为falsy，本字段禁用
  - `none`: 当依赖的所有字段值均不为falsy时，本字段禁用
  - 布尔值`true`: 相当于`all`
- `requireWhenDepTruthy`: 控制当依赖的字段值什么情况下本字段变成必选，可选值与`disableWhenDepFalsy`相同，但是注意**判断的条件变成了truthy**
- `validateWhen`、`revalidateWhen`: 校验的时机中有可选值`depChange`，当依赖值变化后触发校验

<!-- @Code:deps -->