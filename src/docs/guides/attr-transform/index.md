---
title: 属性转换
lang: zh-CN
---

自定义元素存在两种属性：`attribute` 和 `property`。所有元素的属性均可以通过`property`设置，如`button.disabled = true`，而原始值也可以通过`HTML Attribute`设置，例如字符串、数字（会尝试将字符串转换为数字）、布尔值（当有属性时为`true`，无属性时为`false`），其他类型如对象、数组、函数等，则必须通过`property`设置。

现代框架一般会智能判断往`property`赋值还是设置为`attribute`，我们可以比较轻易地设置复杂类型的值，但如果我们是在HTML中编写呢，使用JS查找再赋值又不够方便，这时我们就可以使用属性转换。

# 属性转换

通过`GlobalStaticConfig.attrTransform`可以设置某个组件的某个属性的转换逻辑，也可以设置所有组件某个属性的转换逻辑，例如

```ts
GlobalStaticConfig.attrTransform.common.disabled = (val) => val === 'false' ? false : !!val;
GlobalStaticConfig.attrTransform.button.size = (val) => {
  try {
    return JSON.parse(val);
  } finally {
    return val;
  }
}
GlobalStaticConfig.attrTransform['virtual-renderer'].renderer => (val) => new Function('item', val);
```

属性转换需自行处理非法值和异常，复杂的属性转换会影响性能，尽量避免使用