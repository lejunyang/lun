---
title: Table 表格
lang: zh-CN
---

:::warning 注
highly experimental

尚在初期功能实现验证阶段，决定使用 Grid 渲染表格，而不是 table 元素
:::

## 基本使用

表格由行数据及列定义决定表格内容，可通过`columns`属性在表格上定义列，也可以直接在表格下渲染`l-table-column`，两种方式可结合使用，属性定义的列会在前面

列通过`name`属性指定其在每一行渲染的字段，与`l-form-item`类似，其可以为对象嵌套字段，例如`user.name`或`['user', 'name']`

列可以嵌套，在渲染时其会自动将表头组合形成多级结构。`columns`通过指定`children`进行嵌套，而 DOM 则直接渲染子节点即可

<!-- @Code:_devTest -->
<!-- @Code:nested -->

:::warning 注
不要自行在表格及表格列下渲染其他内容，除非你使用绝对定位，否则其会严重影响 Grid 布局

也不要更改表格列以及其 Shadow DOM 根节点样式的`display`属性，它们默认均为`display: contents`，也就是只渲染子节点，从而避免影响 Grid 布局，如有需要你可以更改为[Subgrid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Subgrid)
:::

## 行/列合并

对于表格头，只需通过`headerColSpan`即可设置表头合并

而对于单元格，使用`cellProps`，动态设置`rowSpan`和`colSpan`即可设置单元格的合并。`rowSpan`和`colSpan`在内部有处理，只需给合并区域左上角那个单元格设置其属性即可，其他单元格无需设置对应属性。
合并单元格遵循先设置先生效，后面被合并的单元格即使设置了也不会生效

<!-- @Code:rowColSpan -->

## 粘性列

设置`sticky`属性即可将该列将变为粘性定位，其可以为`left`（`true`相当于`left`）或`right`。对于嵌套列来说，只需在顶层列设置即可，下面的列也会粘到同一位置

暂不支持将设置了`headerColSpan`的列以及后面被它覆盖的列设置为粘性列

<!-- @Code:sticky -->

## 自定义列宽与拖拽调整列宽

通过`width`属性可设置列宽，表格列的宽度默认为`max-content`，其可以设置为任意 Grid 列有效值，例如`1fr`, `fit-content()`, `minmax(min, max)`等等，数字会被视为像素值

设置`resizable`属性可允许用户通过拖拽表格头的右边界来调整列宽。用户调整列宽后，再去更新该列的`width`属性将不会生效，会以用户调整的列宽优先

注意，在嵌套列的情况下，列宽仅允许在最底层的列上设置，非叶子节点列设置宽度无效。`resizable`也只能设置在最底层的列上

<!-- @Code:width -->

## 自定义行高

通过`headerHeight`属性可设置表头的高度，其可以设置为任意 Grid 行有效值，例如`1fr`, `fit-content()`, `minmax(min, max)`等等，数字会被视为像素值，默认为`auto`

通过`rowHeight`属性可设置行高，有效值同上，且其可以为函数，用于单独设置每一行的高度

## 行单选

表格默认支持行单选，但是需要自行设置对应的动作或调用相关函数使行选中，可见下面的[行与单元格动作](#行与单元格动作)

通过`selected`属性指定 key 可控制哪行被勾选，通过`select`事件可监听勾选变更

你可以添加`selectColumn`属性使表格渲染默认的勾选列，其也可以设置为对象以添加其他你想要的列属性。如果你需要控制勾选列的顺序，你可以在`columns`数组中想要的位置添加默认提供的`TABLE_RADIO_SELECT_COLUMN`对象来渲染默认的单选框列，这个对象的详情可参考下面，因此你也可以自行设置这样的列来编写更多自定义逻辑

:::details 单选列对象详情
`TABLE_RADIO_SELECT_COLUMN`就是一个如下所示的简单对象，如果你有更多的自定义需求可参考

```ts
const TABLE_RADIO_SELECT_COLUMN = {
  type: 'radio-select',
  width: 50,
  justify: 'center',
}
// 这个type相当于给该列指定了下面这个renderer
({ key, context }: InternalTableColumnRendererParams) =>
  renderElement('radio', {
    checked: context.rowSelect.isSelected(key),
    onUpdate() {
      context.rowSelect.select(key);
    },
  })
```

:::

<!-- @Code:singleSelect -->

## 行多选

多选需要将`selectionMode`设置为`multiple`，且与单选一样需要自行配置动作或调用相关函数

通过`selected`属性可控制哪行被勾选，其支持 Set 或数组，通过`select`事件可监听勾选变更

与单选相同，你可以添加`selectColumn`属性使表格渲染默认的勾选列，当设置了`selectionMode`时添加的列会自动变为多选框列。同样你可以使用默认提供的`TABLE_CHECKBOX_SELECT_COLUMN`来自定义复选框列

:::details 复选列对象详情
`TABLE_CHECKBOX_SELECT_COLUMN`就是一个如下所示的简单对象，如果你有更多的自定义需求可参考

```ts
const TABLE_CHECKBOX_SELECT_COLUMN = {
  type: 'checkbox-select',
  width: 50,
  justify: 'center',
  header: ({ context: { rowSelectionState, rowSelect } }: { context: TableExternalContext }) =>
    renderElement('checkbox', {
      checked: rowSelectionState.allSelected,
      intermediate: rowSelectionState.intermediate,
      onUpdate(e: CustomEvent<{ checked: boolean }>) {
        if (e.detail.checked) rowSelect.selectAll();
        else rowSelect.unselectAll();
      },
    }),
}
// 这个type相当于给该列指定了下面这个renderer
({ key, context }: InternalTableColumnRendererParams) =>
  renderElement('checkbox', {
    checked: context.rowSelect.isSelected(key),
    onUpdate() {
      context.rowSelect.toggle(key);
    },
  })
```

:::

<!-- @Code:multipleSelect -->

## 行展开

通过一系列属性可开启表格的行展开功能，并自定义行展开的渲染内容：

- `rowExpandedRenderer`：若返回非`null`或`undefined`，则该行可以展开，其返回的内容会用自定义渲染作为展开内容
- `rowExpanded`：控制哪些行已展开，其可以为 Set 或数组，值为行数据的 key（没有则为 index），可通过`rowExpand`事件监听用户展开收起

你可以在表格或表格列上设置`actions`来控制哪里可以点击展开/收起，具体可见下一节。未来会添加展开/收起列

:::details 展开/收起过渡动画
由于表格是 Grid 布局，可展开行内容由`0fr <-> 1fr`控制是否渲染，因此支持 CSS 过渡，你可通过表格根元素的 transition 来控制

另外，你可以看到下面的例子设置了固定的行高和表头高度，这是因为发现当其为默认 auto 时，展开/收起一行时会出现高度抖动，不知道为什么，而展开多行时没有问题
:::

<!-- @Code:expandable -->

## 行与单元格动作

表格内部定义了一系列动作用于调用，表格和表格列上均可以通过`actions`属性设置需要监听的事件并触发相应动作，其可以为三种格式：

- 字符串：在 click 后触发相应动作，目前内部支持的动作请查看详情
  :::details 内部动作列表
  - `rowExpand.toggle`: 展开/收起当前行
  - `rowExpand.expand`: 展开当前行
  - `rowExpand.collapse`: 收起当前行
  - `rowExpand.expandAll`: 展开所有行
  - `rowExpand.collapseAll`: 收起所有行
  - `rowSelect.toggle`: 切换当前行选中状态
  - `rowSelect.select`: 选中当前行
  - `rowSelect.unselect`: 取消当前行选中
  - `rowSelect.selectAll`: 全选所有行
  - `rowSelect.unselectAll`: 取消全选所有行
    :::
- 函数：在 click 后调用该函数，函数参数中可以获取点击区域的相关信息，如下

```ts
export type TableActionParams = {
  /** 当前行数据 */
  row: unknown;
  /** 当前行索引 */
  index: number;
  /** 当前行数据的key */
  key: string | number;
  /** 当前列的属性 */
  props: TableColumnSetupProps;
  /**
   * 供外部调用的一些方法和状态，
   * 例如其中的`rowSelect`和`rowExpand`包含改变行选中和展开状态的方法，
   * 也就是上面列出的那些动作
   * 但不同的是，这些函数需要你手动传参（一般是传该行的key）
   */
  context: TableExternalContext;
};
```

- 对象：不同事件触发不同动作的对象，其格式如下

```ts
// 表格列可设置的对象
type TableColumnActions = Record<
  'onCellClick' | 'onCellDblclick' | 'onCellContextmenu',
  ((params: TableActionParams) => void) | TableActionKeys
>;
// 表格可设置的对象
type TableActions = Record<
  'onRowClick' | 'onRowDblclick' | 'onRowContextmenu',
  ((params: TableActionParams) => void) | TableActionKeys
>;
```

<!-- @Code:actions -->

## 列隐藏

可直接通过 HTML `hidden`属性隐藏列。另外，由于表格由 Grid 实现，你也可以利用`0fr`来实现隐藏加过渡

<!-- @Code:hidden -->

## 内容对齐方式

通过`justify`和`align`属性可设置单元格内容的水平/垂直对齐方式，其会给单元格设置内联`justify-content`和`align-items`，默认水平对齐为`start`，垂直对齐为`center`

对于嵌套列，该值不会影响其子节点列，只会影响其自身的表格头

<!-- @Code:align -->

## 虚拟渲染

添加`virtual`属性即可开启虚拟渲染，表格本身需要设置一定的高度来变成滚动容器，开启后将只渲染可见区域及附近的行。注意，暂不支持单元格合并以及行展开，等虚拟渲染组件稳定后将开放更多属性

:::info 注
开启虚拟渲染后表格将通过`rowHeight`计算每行的行高，推荐返回数字以设置固定行高，否则需要渲染后计算行高以调整，表现有点不佳

另外，开启虚拟渲染后推荐给列设置固定宽度而不是由内容撑开。如果由内容撑开，由于在滚动过程中只渲染了某些行，列宽度会可能会一直变化，从而导致布局闪烁变动
:::

<!-- @Code:virtual -->
