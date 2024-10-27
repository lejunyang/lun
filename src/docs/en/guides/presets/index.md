---
title: 预设
lang: zh-CN
---

组件库内有两个预设，分别是 `math` 和 `date`，它们分别用于数字计算和日期处理，通过`GlobalStaticConfig`可自定义实现。

## math

`math`提供了一些用于数字计算的函数，内部预设支持大数和高精度小数，目前`l-input`和`l-range`使用了它，通过对应属性设置字符串模式便可使用

## date

`date`提供了一些用于日期处理的函数，涉及日期的组件如`l-calendar`、`l-date-picker`使用了它。不同于`math`，内部没有设置默认实现，但提供了`dayjs`的实现，需要由用户自行引入或设置其他实现

```js
import '@lun-web/core/date-dayjs'; // 引入dayjs实现

// 或自行实现
import { GlobalStaticConfig } from '@lun-web/components';
import { createDatePreset } from '@lun-web/core';
GlobalStaticConfig.date = createDatePreset({
  // ...
});
```

若需要类型支持，则需要自行通过以下方式：
```ts
declare module '@lun-web/core' {
  export interface DateInterface {
    date: Dayjs;
  }
}
```

<!--this file is copied from Chinese md, remove this comment to update it, or it will be overwritten on next build-->