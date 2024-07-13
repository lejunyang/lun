---
title: FormItem 表单项
lang: zh-CN
---

## 卸载行为

默认情况下，表单项卸载后 Form 仍会保留其值，通过`unmountBehavior`可设置表单项卸载后的行为，可为：

- `delete`: 卸载后删除值
- `toNull`: 卸载后值设置为`null`
- `toUndefined`: 卸载后值设置为`undefined`

<!-- @Code:unmountBehavior -->