---
title: Form 表单
lang: zh-CN
---

## 表单实例

表单由`useForm`产生的实例进行管控，该实例可被多个表单共享，其用于方便管理表单的数据、状态、方法以及事件。如果在组件加载时未指定`instance`，内部会创建一个，该属性**不可以动态指定**。

实例的属性和方法都会暴露到组件 DOM 节点本身，ts 类型过长暂不列出，你可以在控制台选中节点，通过`dir($0)`查看有哪些属性和方法

<!-- @Code:useForm -->

## 公共属性与默认插槽

通过`itemProps`可以给表单下所有的`l-form-item`设置公共属性，`itemProps`还可以为函数以便于动态设置

```ts
type itemProps =
  | Partial<Omit<FormItemSetupProps, 'deps'>>
  | ((params: {
      formContext: CollectorContext<FormSetupProps, FormItemSetupProps, FormProvideExtra> | undefined;
      formItemProps: FormItemSetupProps;
    }) => Partial<Omit<FormItemSetupProps, 'deps'>>);
```

`l-form-item`的默认插槽用于放置输入组件，只要配置了`name`属性，其下的输入组件便可以自动获取和设置表单的值（表单支持的组件可见左侧菜单“输入组件”）

另外，`l-form-item`也可以通过`element`属性和`elementProps`属性直接设置其下渲染的组件，其中`elementProps`也可以设置为函数。如果设置了`element`，`l-form-item`的默认插槽下的内容便会渲染到输入组件的默认插槽下

```ts
type elementProps =
  | object
  | ((param: {
      formContext: CollectorContext<FormProps, FormItemProps, FormProvideExtra> | undefined;
      formItemProps: FormItemSetupProps;
    }) => any);
```

动态的公共属性某些时候会非常有用，能够减少很多重复的设置，而单个字段也可由自己的属性覆盖，可以看下面的示例查看效果

<!-- @Code:commonProps -->

## 所有表单组件

<!-- @Code:allComponents -->

:::warning 注
数组字段必须在`l-form-item`上设置`array`属性，其下的输入元素需要自行渲染，不可通过`element`属性设置，输入元素无需自行更新和设置 value，其会根据 dom 顺序确定在数组中的 index 并取值或更新
:::

## 依赖字段

`l-form-item`可通过`deps`属性可设置该字段依赖的其他字段，其值为其他字段的 name 字符串或 name 数组。当其依赖字段的值发生变化后，可自动控制该字段清除、禁用、必输、校验，具体可通过以下属性进行控制

- `clearWhenDepChange`: 当其为`true`时，依赖字段的值变化后，本字段值清空
- `disableWhenDep`: 控制当依赖的字段值什么情况下本字段变为禁用，必须要有依赖的字段本属性才会生效，可选值有：
  - `all-truthy`: 当依赖的所有字段值均为 truthy 时，本字段禁用
  - `some-truthy`: 当依赖的所有字段值中有任一为 truthy，本字段禁用
  - `all-falsy`: 当依赖的所有字段值均为 falsy 时，本字段禁用
  - `some-falsy`: 当依赖的所有字段值中有任一为 falsy，本字段禁用

  可以为数组，数组设置多个值，必须全部满足。目前这些条件适合设成数组的只有`['some-truthy', 'some-falsy']`，意味着必须同时存在真值和假值
- `requireWhenDep`: 控制当依赖的字段值什么情况下本字段变成必选，可选值与`disableWhenDep`相同
- `validateWhen`、`revalidateWhen`: 校验的时机中有可选值`depChange`，当依赖值变化后触发校验

<!-- @Code:deps -->

## 校验

- 部分校验属性与输入组件也有关（如`type`, `min`, `max`, `step`, `precision`），它们可以直接在`l-form-item`上设置，其下的输入组件会自动继承，无需额外设置
- 设置数字的校验属性也可以设置为其他字段的值，可以这样设置的属性有`min`, `max`, `step`, `precision`, `moreThan`, `lessThan`, `len`

:::info 说明
下例中的字段“已使用”，其 max="total"，意味着如果“总量”字段有值且为数字的时候，它的 max 取值则为“总量”的值，另外，下面所有的数字字段 step 和 precision 属性都直接设为了“布长”和“精度”字段的值
:::

<!-- @Code:validate -->
