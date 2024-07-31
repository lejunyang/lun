---
title: FormItem 表单项
lang: zh-CN
---

## 提示和校验信息

表单项有三种提示信息：help, tip, statusMessages，前两种由同名属性自行设置，statusMessages 由校验获得。help 侧重于展示帮助信息，tip 侧重于展示提示信息，当存在校验信息时则会覆盖它。它们支持多种形式展示：

- `tooltip`: 在输入框以 Tooltip 的形式展示，展示的优先级 statusMessages > help > tip
- `newLine`: 在输入框下方以新行的方式展示，help总会展示，优先级 statusMessages > tip
- `icon`: 在标签处以 Icon 加 Tooltip 的形式展示

提示信息由以下属性控制它们的展示形式：

- `tipType`控制 tip 和 statusMessages 的展示形式，支持`tooltip`和`newLine`
- `helpType`控制 help 的展示形式，支持`icon`, `tooltip`和`newLine`

<!-- @Code:tipAndMessages -->

## 卸载行为

默认情况下，表单项卸载后 Form 仍会保留其值，通过`unmountBehavior`可设置表单项卸载后的行为，可为：

- `delete`: 卸载后删除值
- `toNull`: 卸载后值设置为`null`
- `toUndefined`: 卸载后值设置为`undefined`

<!-- @Code:unmountBehavior -->
