---
title: Input 输入
lang: zh-CN
---

## 基本使用

<!-- @Code:basicUsage -->

## placeholder

<!-- @Code:placeholder -->

## 插槽

<!-- @Code:slots -->

## 多值

当设置`multiple`后`l-input`变为多值输入框，以下属性在多值时可用：

- `separator`: 分隔符，默认为空白字符和逗号，在[值更新时](#自定义更新时机)会根据其对输入字符串进行分割
- `unique`: 是否允许重复值，默认允许
- `maxTags`: 限制最大标签数量
- `wrapTags`: 可控制标签过多时是否换行，换行展示会将输入框撑开，展示所有标签
- `tagRemoveIcon`: 当可编辑时，是否为每个标签展示删除 icon

:::tip 注
多值时支持键盘导航，通过 Tab、Shift+Tab 或左右箭头均可以切换聚焦的 Tag，按删除键可删除当前聚焦的 Tag（不区分 BackSpace 和 Delete）。当聚焦为输入框时按下 BackSpace 则是直接删除前一个 Tag
:::

<!-- @Code:multiple -->

## 数字输入

- `type=number`: 即原生的数字输入，此时 update 事件中的值是数字。与原生一样，某些无效的输入无法在输入时限制，比如你可以输入--, --5, ++3, 4-这样的值，不过与原生不同，这样的值在 blur 后我们会清除
- `type=number-text`: 字符串数字，**支持大数与高精度小数**，此时 update 事件中的值是字符串。与 type=number 不同，某些无效的输入在输入时即可被阻止
- `步长`: 每次增加/减少的数字，可以为小数，为 0 则不修改值
- `精度`: 设置精度后，在 change 事件时会对数字进行修正，多余的小数进行四舍五入。精度必须为非负整数，否则无效。当精度为 0 时，不允许输入小数
- `moreThan`: 最小值，但不可等于（min 可以等于）
- `lessThan`: 最大值，但不可等于（max 可以等于）
- `禁止指数`: 默认可以输入科学计数法，即 1e-5 或 1.8E5，禁止指数后将不可再输入科学计数法

:::info 严格模式
严格模式下这些数字限制会增加一些额外的行为：

- 步长: 会修正到`precision`对应精度；若步长为整数，则不允许输入小数
- min、moreThan: 会修正为能整除`step`，会修正到`precision`对应精度，大于原来的值
- max、lessThan: 会修正为能整除`step`，会修正到`precision`对应精度，小于原来的值
- change 事件时会对值进行修正，检查是否满足上述所有属性（对于 moreThan 和 lessThan，如果有设置 step，则加上/减少一个 step 的值，否则不进行更改）
  :::

<!-- @Code:restrictNumber -->

## 数字布进器

通过`stepControl`属性可控制数字步进器的种类，可选值有`up-down`和`plus-minus`，其他任意值视为不展示步进器

<!-- @Code:typeNumber -->

## 密码输入

<!-- @Code:password -->

## 展示字数

没有设置`maxLength`时展示当前字数，设置`maxLength`时两者一起展示。多值时以当前输入的字符为准

<!-- @Code:showLengthInfo -->

## 不同变体

<!-- @Code:differentVariants -->

## 自定义更新时机

通过`updateWhen`属性来自定义输入值的更新时机，其默认值为`auto`，可选值有：

- `input`: input 事件时触发更新，当`multiple`为 true 时，在输入过程中遇到`separator`便立即更新
- `notComposing`: 同样在 input 事件时触发更新，但是如果处于 composition 则不更新
- `change`: change 事件时触发更新
- `auto`: 当`multiple`为 true 时相当于`change`，当为 false 时相当于`notComposing`

同时，`updateWhen`支持设置为数组，这通常用于`multiple`为 true 的时候

<!-- @Code:updateWhen -->

## 自定义字符限制时机

`restrict`, `maxLength`, `replaceChPeriodMark`这三个属性会限制输入的内容，而`restrictWhen`决定了限制的时机，其可选值有`beforeInput`, `input`, `notComposing`, `change`
:::warning 注
不建议将 restrictWhen 设为 input，在 input 事件中限制字符输入，如果此时处于中文输入 composition 下会导致字符被吞，但是输入法仍然显示你输入的字符，而且会出现怪异的行为。推荐设为 notComposing
:::

<!-- @Code:restrictWhen -->

## 自定义值转换时机

`transformWhen`用于设置输入值转换的时机，值转换会发生在输入后，发出更新事件前

可选值有`input`, `notComposing`, `change`，默认为`notComposing`

<!-- @Code:transformWhen -->

:::warning 注
`updateWhen`必须包含`transformWhen`，值才会被转换
:::

## 自定义渲染

`renderer`插槽可用于自定义渲染输入框在未编辑且未被悬浮时的展示内容

<!-- @Code:renderer -->

## 浮动标签

通过将`labelType`设置为`float`即可开启浮动标签，当使用浮动标签时，优先取`label`属性作为浮动标签，若没有则取`placeholder`

<!-- @Code:floatLabel -->

## 轮播标签

通过将`labelType`设置为`carousel`即可开启轮播标签，此时你可以自行更新`label`字符串，标签会有相应动画效果，也可以将`label`设置为包含`interval`属性的对象以自动更新标签

```ts
// 若不为该格式或interval不为大于0的数字，则会将对象转为字符串展示；若其中有values数组且不为空，则会从values中循环遍历更新标签
type AutoUpdateLabel = { interval: number; values?: string[] };

// 所以也可以用toString来动态设置标签
const label = {
  interval: 2000,
  toString() {
    return `动态标签${new Date()}`;
  },
};
```

<!-- @Code:carouselLabel -->
