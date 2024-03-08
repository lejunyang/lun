---
title: Form 表单
lang: zh-CN
---

## 表单管控

表单由`useForm`产生的实例进行管控，该实例可被多个表单共享，该实例用于方便管理表单的数据、状态、方法以及事件。如果在`form`加载时未指定`instance`，内部会创建一个，该属性不可以动态指定。

实例的属性和方法都会暴露到`form`DOM节点本身，ts类型过长暂不列出，你可以在控制台选中form节点，通过`dir($0)`查看有哪些属性和方法

<!-- @Code:useForm -->

## 所有表单组件

<!-- @Code:allComponents -->

:::warning 注
数组字段必须在`form-item`上设置`array`属性，其下的输入元素需要自行渲染，不可通过`element`属性设置，输入元素无需自行更新和设置 value，其会根据 dom 顺序确定在数组中的 index 并取值或更新
:::

## 依赖字段

通过`deps`属性可设置该字段依赖的其他字段，其值为其他字段的 name 字符串或 name 数组。当其依赖字段的值发生变化后，可自动控制该字段清除、禁用、必输、校验，具体可通过以下属性进行控制

- `clearWhenDepChange`: 当其为`true`时，依赖字段的值变化后，本字段值清空
- `disableWhenDepFalsy`: 控制当依赖的字段值什么情况下本字段禁用，可选值有：
  - `all`: 当依赖的所有字段值为 falsy 时，本字段禁用
  - `some`: 当依赖的所有字段值中有部分为 falsy，本字段禁用
  - `none`: 当依赖的所有字段值均不为 falsy 时，本字段禁用
  - 布尔值`true`: 相当于`all`
- `requireWhenDepTruthy`: 控制当依赖的字段值什么情况下本字段变成必选，可选值与`disableWhenDepFalsy`相同，但是注意**判断的条件变成了 truthy**
- `validateWhen`、`revalidateWhen`: 校验的时机中有可选值`depChange`，当依赖值变化后触发校验

<!-- @Code:deps -->

## 校验

- 部分校验属性与输入组件也有关（如`type`, `min`, `max`, `step`, `precision`），它们可以直接在`form-item`上设置，其下的输入组件会自动继承，无需额外设置
- 设置数字的校验属性也可以设置为其他字段的值，可以这样设置的属性有`min`, `max`, `step`, `precision`, `moreThan`, `lessThan`, `len`

:::info 说明
下例中的字段“已使用”，其max="total"，意味着如果“总量”字段有值且为数字的时候，它的max取值则为“总量”的值，另外，下面所有的数字字段step和precision属性都直接设为了“布长”和“精度”字段的值
:::

<!-- @Code:validate -->
