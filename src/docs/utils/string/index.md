---
title: 字符串
lang: zh-CN
---

## hyphenate

驼峰转为连线格式

该函数自带缓存，转换过的字符串会被缓存

```ts
hyphenate('myButton') // => my-button
```

## capitalize

首字母大写

## uncapitalize

首字母小写

## stringToPath

将路径字符串转换为数组

```text
a.b[c][0].d => ['a', 'b', 'c', '0', 'd']
[0].a => ['0', 'a']
a["b"]['c']['d"] => ['a', 'b', 'c', `'d"`]
a[][b] => ['a', 'b']
a..b => ['a', 'b']
a[[b]]c => ['a', '[b]', 'c']
```
