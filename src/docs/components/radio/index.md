---
title: Radio 单选框
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## 卡片单选组

`type="card"`的`radio-group`为松散的小型卡片组

<!-- @Code:cardGroup -->

## 按钮单选组

`type="button"`的`radio-group`为紧凑的按钮组，其下的`radio`会自动根据位置来设置样式（例如第一个和最后一个需要特殊设置边框和圆角）

这需要`radio`之间没有任何其他内容，其他内容的插入会导致中间的`radio`没有边框。如果有额外的内容，你需要给相应位置的`radio`添加`start`或`end`属性来正确设置样式，如下所示

<!-- @Code:buttonGroup -->

:::warning FIXME
太丑了，有空改一下。另外考虑将card和button-group改为variant，而不是type
:::

## 不同大小

<!-- @Code:differentSizes -->

## 不同颜色

<!-- @Code:differentColors -->

## 不同圆角

<!-- @Code:differentRadius -->
