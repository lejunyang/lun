# `@lun-web/core` — AGENTS.zh-CN.md

> 给组件库用的（带 Vue 味的）hooks / composables / presets。**这里不放任何 DOM 组件**。
> 根总览：[`../../AGENTS.zh-CN.md`](../../AGENTS.zh-CN.md)。英文：[`AGENTS.md`](./AGENTS.md)。

## 目录

```
src/
  hooks/         # 通用 Vue setup-time hooks（不关心自定义元素）
    state.ts            — 小型响应式原语（objectComputed、useRefMap、useRefWeakMap …）
    useSetupEdit.ts     — disabled/readonly/loading 通过 provide/inject 继承
    useSetupEvent.ts    — 拦截 emit，让 observer（如 form-item）能拦截事件派发
    useClickOutside.ts  — 跨 shadow 的 click-outside 检测
    useOverflowWatcher.ts
    useRefs.ts          — 组合式 ref 集合
    DOM.ts              — hooks 用到的 DOM 帮手
    lifecycle.ts        — 额外的生命周期帮手
    shadowDOM.ts        — shadow root 帮手
    instance.ts         — Vue instance 帮手
    createUseModel.ts   — useValueModel / useOpenModel / useCheckedModel 的底座
  composable/    # 跨组件共享的高级积木
    createCollector.ts  — 父/子注册（form、select、tabs、tree、table …）
    createHooks.ts      — 给 collector 用的类型化 pub/sub
    createUseObserver.ts
    form/               — useForm + 校验规则机制
    select/             — 选择状态、option 激活、搜索过滤
    input/              — 文本输入不变量（数字夹紧、多 tag 切分、IME 合成 …）
    popover/, dialog/   — open 状态原语
    table/, tree/, virtual/, mentions/, dnd/, date/, watermark/
    size.ts             — 响应式 size 解析
  presets/       — 可替换运行时预设（math、date）
    math.ts             — 高精度数值运算（BigIntDecimal）
    date.ts / date.dayjs.ts  — 日期抽象；dayjs 是默认，可替换
  utils/         — 本地帮手（objectComputed 描述符、ref 转换器）
```

## 强制规则

- **不准 import `components`。** 本包要能独立被消费 —— 它在 `@lun-web/components` 之下。反向依赖会破坏根总览里的依赖方向。
- **不写 DOM 组件代码。** 只写纯逻辑 / hooks。需要 `defineCustomElement` 的逻辑放 `@lun-web/components`。
- **只通过 `src/<area>/index.ts` 重导出**，最终被 `packages/core/index.ts` 再次重导出。外部用户 import `'@lun-web/core'`（或 `'@lun-web/core/date-dayjs'`）。
- **Date 可替换。** 任何读日期的代码走 `GlobalStaticConfig.date`（在 components 端），它代理到 `DateMethods<DateValueType>` 适配器。默认适配器是 `presets/date.dayjs.ts`。要支持其他库（luxon、date-fns）就照着 dayjs 的样子加一个同级 preset。通过 `DateInterface` 模块声明做类型扩展。
- **Math 可替换。** 形状同 date —— `presets/math.ts` 用 `BigIntDecimal`。**别** 在组件里散落原生数值运算，走 `GlobalStaticConfig.math`。

## 推荐模式

### 新增 hook

通用、Vue 感知、不关心 DOM / CE：

```ts
// src/hooks/useFoo.ts
import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import type { MaybeRefLikeOrGetter } from '@lun-web/utils';

export function useFoo(source: MaybeRefLikeOrGetter<string>) {
  const vm = getCurrentInstance();
  if (!vm && __DEV__) throw new Error('useFoo must be called in setup');
  const state = ref('');
  // ... 响应式连接 ...
  onBeforeUnmount(() => { /* 清理 */ });
  return state;
}
```

- DEV 模式始终检查 `getCurrentInstance()`，throw 带清晰消息。
- 用 `MaybeRefLikeOrGetter<T>`，让调用方可以传 value / ref / getter / `RefLike`（组件里偶尔传的 `Ref`-shape 对象）。
- `unrefOrGet(x)` 是通用解包。

### 新增 collector

完整示例看 `composable/form` 和 `composable/select`。最小可用：

```ts
import { createCollector } from '../createCollector';
const FooCollector = createCollector({
  name: 'foo',
  parentExtraProvide(provided) {
    return { /* 加到 context 上的方法/状态 */ };
  },
});
export const useFooParent = FooCollector.parent;
export const useFooChild = FooCollector.child;
```

`createCollector` 负责排序、tree level 跟踪、按 DOM 顺序排子、异步等待、SSR `parentMounted`。

### 新增 model

`createUseModel` 工厂搭出 `value` ↔ `update`（或 `open` ↔ `update`、`checked` ↔ `update`）的双向通道：

```ts
export const useFooModel = createUseModel({
  defaultKey: 'foo',
  defaultEvent: 'update',
  extra: () => { /* 可选的额外上下文，如父 collector */ },
  getFromExtra: (extra, raw) => /* 从父读 value */,
  setByExtra: (extra, val, raw) => /* 写回父 */,
});
```

底层实现在 `state.ts`，components 端使用方 `useValueModel`。

### Date / math

同模式：`*.ts` 里声明接口并导出一个 `presets` 常量，components 端通过 Proxy 消费：

```ts
// presets/math.ts（精简）
export const presets = { math: defaultMathImpl };
// 替换方式：import 'your-preset';（在加载时改写 GlobalStaticConfig.math）
```

## `hooks/` 和 `composable/` 怎么分？

- `hooks/` —— 通用、形状偏框架、单一职责。返回小 API。例：`useSetupEdit` 返回 `[editComputed, editState]`。
- `composable/` —— 偏领域、组合多个 hooks、通常绑定到某个功能区（form、table、dnd）。例：`composable/form/useForm.ts` 协调规则、hooks、方法、状态。

经验法则：组件会直接 import 的，多半是 hook；同一功能下多个组件共享的，多半是 composable。

## 测试

- 跑在 `happy-dom`，**没有真浏览器**。不要依赖真实布局、focus、滚动、`getBoundingClientRect`。
- 需要宿主时用 `@vue/test-utils` mock Vue 组件。否则把 hook 包进 `defineComponent({ setup() { useFoo(); return () => null } })` 再 mount。

## Don't

- **不要** import Vue 的深路径类型（`vue/types/...`）—— 只用公开导出。
- **不要** 新加全局状态单例。要让组件共享的状态放 `GlobalStaticConfig` / `GlobalContextConfig`（在 `@lun-web/components/config`），不放这里。
- **不要** 在本包写 `'@lun-web/components'`，类型 import 都不行，破坏构建图。
- **不要** 加一个 `@lun-web/utils` 里已经有的 util。先去那里搜。
