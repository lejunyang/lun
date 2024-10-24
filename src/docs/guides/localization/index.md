---
title: 本地化
lang: zh-CN
---

## 文本本地化

某些组件自带文本，如`Dialog`的确定、取消按钮，`FormItem`的校验失败信息，这些文本都定义在`locales`中，其格式如下所示：

```ts
export const locales = {
  'zh-CN': {
    'validation.number.type': '必须为数字',
    'validation.required': ({ label } = {}) => `请填写${label || '此字段'}`,
    'validation.number.min': '不得小于${min}',
    'date.yearFormat': 'YYYY年',
    'dialog.ok': '确定',
  }
}
```

可以看到，本地化配置有多种格式，对于那些会传递变量的条目来说，你可以使用函数来动态生成，也可以直接使用字符串加变量`${var}`的方式（**注意是普通字符串，不是模板字符串**）。

而对于`date.yearFormat`这样的条目，其中的YYYY是组件使用的dayjs的格式，需要具体参照使用的时间处理库


你可以随时修改此对象，文本会响应式更新，如要更改当前语言则可通过`GlobalContextConfig`动态更改

```ts
import { locales, GlobalContextConfig } from '@lun/components'

GlobalContextConfig.lang = 'en-US'
locales['en-US'] = {
  // ...
}

```