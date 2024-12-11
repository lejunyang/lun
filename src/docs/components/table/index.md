---
title: Table 表格
lang: zh-CN
---

:::warning 注
highly highly highly experimental

尚在初期功能实现验证阶段，初步决定使用Grid渲染表格，而不是table元素
:::

## 嵌套列

`l-table-column`可嵌套使用，在渲染时其会自动将表头组合形成多级结构

<!-- @Code:test -->

## 行/列合并

对于表格头，只需通过`headColSpan`即可设置表头合并

而对于单元格，使用`cellProps`，动态设置`rowSpan`和`colSpan`即可设置单元格的合并。`rowSpan`和`colSpan`在内部有处理，只需给合并区域左上角那个单元格设置其属性即可，其他单元格无需设置对应属性。
合并单元格遵循先设置先生效，后面被合并的单元格即使设置了也不会生效

<!-- @Code:rowColSpan -->

## 粘性列

在列上设置`sticky`属性即可将列固定在左侧(`left`或`true`)或右侧(`right`)。对于嵌套列来说，只需在顶层列设置即可，下面的列也会固定到同一位置

<!-- @Code:sticky -->