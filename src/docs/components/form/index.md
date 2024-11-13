---
title: Form 表单
lang: zh-CN
---

- 自动接管输入组件的值更新，可随意响应式更新
- 支持嵌套深层字段，支持数组字段
- 支持字段自动触发其他字段，如清除、禁用、必输、校验
- 支持校验规则设置为其他字段的值，自动更新规则与校验
- 校验信息多样，支持错误、警告、成功多种类型的校验信息展示
- 支持多表单处理，支持字段统一属性设置
- 灵活布局，对齐简易

使用示例有待更新

## 基本使用

表单由若干表单项（`l-form-item`）和表单项下的输入组件构成，表单项由`name`属性指定字段名称，支持嵌套字段（如`a.b.c`, `d[0]`）和数组（`['a', 'b', 'c']`）

`l-form-item`下目前仅支持内部的输入组件，只要表单项设置了`name`，输入组件的值将由表单管控，无需手动设置。部分属性既在表单项存在也在输入组件上存在，如`type`, `min`, `max`等等，可以直接在表单项上设置，无需在输入组件上重复设置

表单由`useForm`产生的实例进行管控，该实例可被多个表单共享，其用于方便管理表单的数据、状态、方法以及事件。如果不指定`instance`，那么内部会创建一个

实例的属性和方法都会暴露到组件 DOM 节点本身，你前往下一小节查看其具体类型

<!-- @Code:useForm -->

:::info 注
React 中推荐使用`useReactForm`，通过`renderOnUpdate`选项，使得在React中渲染 data 和 formState 也可以响应式更新
:::

## 表单布局

`l-form`的以下属性影响布局，它们均支持[响应式断点](/components/theme-provider/)：

- `cols`: 指定表单列数
- `layout`: 指定表单布局，可以为`grid`, `inline-grid`, `flex`, `inline-flex`，默认为 grid。grid 布局的好处在于 label 能够更容易对齐，且能带来更强大的布局控制
- `labelWidth`: 标签宽度，当为 grid 布局时，它会赋给 grid-template-columns，当为 flex 布局时，它会赋给 flex-basis。默认 grid 布局时为 max-content，这意味着标签总能完整展示，而且能同一列的标签取最大宽度，使得表单整体对齐，不用手动给某列每个元素设置 labelWidth
- `labelLayout`: 设置表单标签的布局，可选值有：
  - `vertical`：标签在输入元素的上方
  - `horizontal`：标签与输入元素在同一行
  - `none`：不显示标签相关内容（包括 label，requiredMark，colon 等等）

`l-form-item`的以下属性影响布局，首先列出**grid 布局**下可使用的属性

- `labelWidth`: 标签宽度，其为响应式断点属性
- `colSpan`: 指定字段占据的列数
- `rowSpan`: 指定字段占据的行数
- `newLine`: 字段换行展示
- `endLine`: 字段置于当前行末尾
- `fullLine`: 字段换行并占据一整行，比 colSpan 优先级更高
- `preferSubgrid`: 当浏览器支持时，优先使用[`CSS Subgrid`](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid)实现上面的特性，仅在`labelLayout`为`horizontal`的时候有区别

**当为 flex 布局时，上面的属性仅`labelWidth`, `colSpan`和`fullLine`可以使用**，flex布局在标签为horizontal时表现有点糟糕，建议使用vertical标签，或使用grid布局

:::warning 注
若浏览器不支持 subgrid 或 `preferSubgrid`为 false 时，则会使用 display: contents，将 label 和 content 视为单独的两列来兼容实现上面的布局，但是有些特性我找不到合适的方法完美兼容。

以下面的 label3 为例，其 colSpan 为 2，当标签布局为 horizontal 时，若支持 subgrid，这一行放不下，其应该在下一行，但是不使用 subgrid 时，它的 label 和 input 被拆开成两行来。这种情况可以手动为该字段添加`newLine`来避免，或者使用非`horizontal`标签布局

不管何种布局，谨慎往表单下添加其他内容或包裹什么元素，这会直接影响表单项的布局
:::

<!-- @Code:layout -->

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
- 部分校验属性可以直接设置为其他字段的值，其对应的校验规则会自动根据目标值更新，目前当值为数字或日期时可以这样设置，支持的属性如下：
  - 数字：`min`, `max`, `step`, `precision`, `moreThan`, `lessThan`, `len`
  - 日期：`min`, `max`, `moreThan`, `lessThan`

:::info 说明
下例中的字段“已使用”，其 max="total"，意味着如果“总量”字段有值且为数字的时候，它的 max 取值则为“总量”的值，另外，下面所有的数字字段 step 和 precision 属性都直接设为了“布长”和“精度”字段的值
:::

<!-- @Code:validate -->
