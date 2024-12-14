---
title: Table 表格
lang: zh-CN
---

:::warning 注
highly highly highly experimental

尚在初期功能实现验证阶段，初步决定使用 Grid 渲染表格，而不是 table 元素
:::

## 基本使用

表格由行数据及列定义决定表格内容，可通过`columns`属性在表格上定义列，也可以直接在表格下渲染`l-table-column`，两种方式可结合使用，`columns`定义的列会在前面

列可以嵌套，在渲染时其会自动将表头组合形成多级结构。`columns`通过指定`children`进行嵌套，而 DOM 则直接渲染子节点即可

<!-- @Code:_devTest -->
<!-- @Code:nested -->

## 行/列合并

对于表格头，只需通过`headerColSpan`即可设置表头合并

而对于单元格，使用`cellProps`，动态设置`rowSpan`和`colSpan`即可设置单元格的合并。`rowSpan`和`colSpan`在内部有处理，只需给合并区域左上角那个单元格设置其属性即可，其他单元格无需设置对应属性。
合并单元格遵循先设置先生效，后面被合并的单元格即使设置了也不会生效

<!-- @Code:rowColSpan -->

## 粘性列

通过`sticky`属性即可将列设置为粘性列，其可以为`left`（`true`相当于`left`）或`right`。对于嵌套列来说，只需在顶层列设置即可，下面的列也会粘到同一位置

<!-- @Code:sticky -->

## 自定义列宽

通过`width`属性可设置列宽，表格列的宽度默认为`max-content`，其可以设置为任意 Grid 列有效值，例如`1fr`, `fit-content()`, `minmax(min, max)`等等，数字会被视为像素值。

注意，在嵌套列的情况下，列宽仅允许在最底层的列上设置，非叶子节点列设置宽度无效

<!-- @Code:width -->

## 列内容对齐方式

通过`align`属性可设置列内容的对齐方式，相当于给单元格设置`text-align`

<!-- @Code:align -->

## 列隐藏

可直接通过 HTML `hidden`属性隐藏列。另外，由于表格由 Grid 实现，你也可以利用`0fr`来实现隐藏加过渡，你需要自行设置相应的样式来使过渡生效（由于单元格有 padding，隐藏时需要一点额外样式让其看起来更自然点）

<!-- @Code:hidden -->
