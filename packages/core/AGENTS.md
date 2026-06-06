# `@lun-web/core` — AGENTS.md

> Framework-flavoured (Vue) hooks, composables, and presets that the component library is built on. No DOM components live here.
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Layout

```
src/
  hooks/         # generic Vue setup-time hooks (no custom-element knowledge)
    state.ts            — small reactive primitives (objectComputed, useRefMap, useRefWeakMap, …)
    useSetupEdit.ts     — disabled/readonly/loading inheritance via provide/inject
    useSetupEvent.ts    — emit interception so observers (e.g. form-item) can intercept events
    useClickOutside.ts  — shadow-aware click-outside detection
    useOverflowWatcher.ts
    useRefs.ts          — composable refs collection
    DOM.ts              — DOM helpers used by hooks
    lifecycle.ts        — extra lifecycle helpers
    shadowDOM.ts        — shadow-root helpers used by hooks
    instance.ts         — Vue instance helpers
    createUseModel.ts   — the foundation of useValueModel / useOpenModel / useCheckedModel
  composable/    # higher-level building blocks shared across components
    createCollector.ts  — parent/children registry (form, select, tabs, tree, table, …)
    createHooks.ts      — typed pub/sub for collectors
    createUseObserver.ts
    form/               — useForm + validation rule machinery
    select/             — selection state, activate-option, search filter
    input/              — text-input invariants (numeric clamp, multi-tag split, IME composition, …)
    popover/, dialog/   — open-state primitives
    table/, tree/, virtual/, mentions/, dnd/, date/, watermark/
    size.ts             — responsive size resolution
  presets/       — pluggable runtime presets (math, date)
    math.ts             — number arithmetic precision-safe ops (BigIntDecimal)
    date.ts / date.dayjs.ts  — date abstraction; dayjs preset is the default, swap by replacing
  utils/         — local helpers (objectComputed-style descriptors, ref converters)
```

## Hard rules

- **No `components` import.** This package must remain consumable on its own — it sits beneath `@lun-web/components`. Reverse imports break the dependency direction in the root AGENTS guide.
- **No DOM-component code.** Pure logic / hooks only. If your code needs `defineCustomElement`, put it in `@lun-web/components`.
- **Re-export only through `src/<area>/index.ts`** which is in turn re-exported by `packages/core/index.ts`. Public users import `'@lun-web/core'` (or `'@lun-web/core/date-dayjs'`).
- **Date is pluggable.** Anything reading dates goes through `GlobalStaticConfig.date` (in components) which proxies to a `DateMethods<DateValueType>` adapter. The default adapter is `presets/date.dayjs.ts`. To support other libraries (luxon, date-fns) add a sibling preset, mirroring the dayjs file. Augment via the `DateInterface` module declaration.
- **Math is pluggable.** Same shape as date — `presets/math.ts` uses `BigIntDecimal`. Don't sprinkle raw numeric ops; go through `GlobalStaticConfig.math` from the components side.

## Patterns to copy

### A new hook

Generic, Vue-aware, no DOM/CE knowledge:

```ts
// src/hooks/useFoo.ts
import { getCurrentInstance, onBeforeUnmount, ref } from 'vue';
import type { MaybeRefLikeOrGetter } from '@lun-web/utils';

export function useFoo(source: MaybeRefLikeOrGetter<string>) {
  const vm = getCurrentInstance();
  if (!vm && __DEV__) throw new Error('useFoo must be called in setup');
  const state = ref('');
  // ... reactive wiring ...
  onBeforeUnmount(() => { /* teardown */ });
  return state;
}
```

- Always check `getCurrentInstance()` in DEV. Throw with a clear message.
- Use `MaybeRefLikeOrGetter<T>` so callers can pass a value, a ref, a getter, or a `RefLike` (the `Ref`-shaped object the components occasionally pass around).
- `unrefOrGet(x)` is the universal unwrap.

### A new collector

Look at `composable/form` and `composable/select` for full examples. Minimum viable parent/children:

```ts
import { createCollector } from '../createCollector';
const FooCollector = createCollector({
  name: 'foo',
  parentExtraProvide(provided) {
    return { /* methods/state added to the context */ };
  },
});
export const useFooParent = FooCollector.parent;
export const useFooChild = FooCollector.child;
```

`createCollector` handles ordering, tree level tracking, child sort by DOM order, async wait, and SSR `parentMounted`.

### A new model

`createUseModel` factory makes paired `value` ↔ `update` (or `open` ↔ `update`, `checked` ↔ `update`) plumbing:

```ts
export const useFooModel = createUseModel({
  defaultKey: 'foo',
  defaultEvent: 'update',
  extra: () => { /* optional extra context, e.g. parent collector */ },
  getFromExtra: (extra, raw) => /* read value from parent */,
  setByExtra: (extra, val, raw) => /* write value back to parent */,
});
```

Pattern is in `state.ts` (the core implementation) and `useValueModel` (the components-side consumer).

### Date / math

Both follow the same pattern: a `*.ts` declares the interface and exports a `presets` constant that components consume via Proxy.

```ts
// presets/math.ts (abbrev)
export const presets = { math: defaultMathImpl };
// to swap: import 'your-preset'; which mutates GlobalStaticConfig.math
```

## What goes in `hooks/` vs `composable/`?

- `hooks/` — generic, framework-shaped, single-purpose. Returns a small API. Example: `useSetupEdit` returns `[editComputed, editState]`.
- `composable/` — domain-shaped, composes multiple hooks, often tied to a feature area (form, table, dnd). Example: `composable/form/useForm.ts` orchestrates rules, hooks, methods, state.

Rule of thumb: if a component would import it directly, it's probably a hook. If multiple components in the same feature share it, it's a composable.

## Tests

- Runs in `happy-dom`. No browser. Don't rely on real layout, focus, scrolling, or `getBoundingClientRect`.
- Mock Vue components via `@vue/test-utils` if you need a host. Otherwise call hooks inside a `defineComponent({ setup() { useFoo(); return () => null } })` and mount it.

## Don't

- Don't `import 'vue'` types from deep paths (`vue/types/...`) — public exports only.
- Don't introduce a new global state singleton. State that components share belongs in `GlobalStaticConfig` / `GlobalContextConfig` (in `@lun-web/components/config`), not here.
- Don't write `'@lun-web/components'` anywhere in this package. Even as a type-only import. Breaks the build graph.
- Don't add a util that already exists in `@lun-web/utils`. Always check there first.
