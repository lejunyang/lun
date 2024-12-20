---
title: Table 表格
lang: zh-CN
---

:::warning 注
highly highly highly experimental

尚在初期功能实现验证阶段，初步决定使用 Grid 渲染表格，而不是 table 元素
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

通过`sticky`属性即可将列设置为粘性列，其可以为`left`（`true`相当于`left`）或`right`。对于嵌套列来说，只需在顶层列设置即可，下面的列也会粘到同一位置

<!-- @Code:sticky -->

## 自定义列宽与拖拽调整列宽

通过`width`属性可设置列宽，表格列的宽度默认为`max-content`，其可以设置为任意 Grid 列有效值，例如`1fr`, `fit-content()`, `minmax(min, max)`等等，数字会被视为像素值

设置`resizable`属性可允许用户通过拖拽表格头的右边界来调整列宽。用户调整列宽后，再去更新该列的`width`属性将不会生效，会以用户调整的列宽优先

注意，在嵌套列的情况下，列宽仅允许在最底层的列上设置，非叶子节点列设置宽度无效。`resizable`也只能设置在最底层的列上

<!-- @Code:width -->

## 自定义行高

通过`headerHeight`属性可设置表头的高度，其可以设置为任意 Grid 行有效值，例如`1fr`, `fit-content()`, `minmax(min, max)`等等，数字会被视为像素值，默认为`auto`

通过`rowHeight`属性可设置行高，有效值同上，且其可以为函数，用于单独设置每一行的高度

## 内容对齐方式

通过`justify`和`align`属性可设置单元格内容的水平/垂直对齐方式，其会给单元格设置内联`justify-content`和`align-items`，默认水平对齐为`start`，垂直对齐为`center`

对于嵌套列，该值不会影响其子节点列，只会影响其自身的表格头

<!-- @Code:align -->

## 列隐藏

可直接通过 HTML `hidden`属性隐藏列。另外，由于表格由 Grid 实现，你也可以利用`0fr`来实现隐藏加过渡

<!-- @Code:hidden -->

## 行展开

通过`expandable`属性可开启行展开功能

<!-- @Code:expandable -->

## 虚拟渲染

添加`virtual`属性即可开启虚拟渲染，表格本身需要设置一定的高度来变成滚动容器，开启后将只渲染可见区域及附近的行。注意，暂不支持单元格合并以及行展开，等虚拟渲染组件稳定后将开放更多属性

:::info 注
开启虚拟渲染后表格将通过`rowHeight`计算每行的行高，推荐返回数字以设置固定行高，否则需要渲染后计算行高以调整，表现有点不佳

另外，开启虚拟渲染后推荐给列设置固定宽度而不是由内容撑开。如果由内容撑开，由于在滚动过程中只渲染了某些行，列宽度会可能会一直变化，从而导致布局闪烁变动
:::

<!-- @Code:virtual -->
