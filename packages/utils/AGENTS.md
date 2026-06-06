# `@lun-web/utils` — AGENTS.md

> Tree-shakeable, dependency-free JavaScript utilities. No Vue, no DOM-only deps in non-browser modules.
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Layout

```
src/
  algorithm.ts      — binary search, debounce, throttle, retry, …
  array.ts          — ensureArray, at, last, …
  color.ts          — color parsing / conversion
  event.ts          — addEventListener helpers (on/off), event coercion
  function.ts       — runIfFn, noop, identity, once, cacheFunctionByParams/Key, promiseTry, …
  get.ts            — get / set / has on nested paths, virtualGetMerge factories
  is.ts             — type predicates (isString, isObject, isArray, isCSSStyleSheet, …)
  number.ts         — toNumberIfValid, toPxIfNum, BigIntDecimal
  promise.ts        — delay, withResolvers, promiseTry
  set.ts            — set helpers
  string.ts         — capitalize, hyphenate, camelize, …
  time.ts           — time helpers used outside the browser (browser-only goes in browser/)
  type/             — pure TypeScript type utilities (`MaybeArray`, `Constructor`, `UnwrapPrimitive`, `TryGet`, …)
  object/
    compare.ts, copy.ts, index.ts, merge.ts, process.ts, value.ts
                    — object-shaped helpers (pick, pickNonNil, fromObject, objectKeys, freeze, inherit, …)
  browser/
    alias.ts, detect.ts, dom.ts, edit.ts, event.ts, is.ts, keyboard.ts, overflow.ts,
    screen.ts, scroll.ts, shadowDom.ts, style.ts, support.ts, tabbable.ts, text.ts, time.ts
                    — browser-only helpers; gated by `inBrowser` / lazy
  _internal.ts, _internalMethods.ts  — module-private constants, NOT exported via index
```

`packages/utils/index.ts` re-exports every category at the top level so consumers import flat:

```ts
import { isArray, ensureArray, freeze, runIfFn } from '@lun-web/utils';
```

## Hard rules

- **No Vue, no @lun-web/core, no @lun-web/components.** This is the foundation. If you need any of those, you're in the wrong package.
- **Tree-shakeable.** Every export must be a top-level named function/constant. No side-effecting module bodies. No big switch-style "feature" objects.
- **Browser-only code stays under `src/browser/`.** Modules outside that directory must work in Node and in workers. If you must reference `window` / `document`, do it through `inBrowser`, `getDocumentElement()`, or `inBrowser && document...`.
- **No deps.** `package.json` has zero `dependencies` and zero `peerDependencies`. Keep it that way. New external deps go into `@lun-web/components` (or wherever they're consumed), not here.
- **Stable surface.** This package is the lowest-level building block; renaming an export ripples through every other package and every consumer.

## Naming + style

| Kind | Convention | Examples |
|---|---|---|
| Predicates | `isFoo`, returns `boolean` | `isString`, `isElement`, `isHTMLSlotElement` |
| Coercion | `toFoo`, `toFooIfBar` | `toNumberIfValid`, `toPxIfNum`, `ensureArray` |
| Factories | `createFoo`, returns a function or object | `createElement`, `createVirtualMerge`, `cacheFunctionByKey` |
| Polyfill / support gates | `support<Feature>` const, `inBrowser` | `supportPopover`, `supportCSSAutoHeightTransition`, `supportCustomElement` |
| Inline if-fn | `runIfFn(maybeFn, ...args)` | use this instead of `typeof x === 'function' ? x(...args) : x` |
| Functional helpers | curry-friendly arg order: `(thing, options)` | `freeze`, `inherit`, `pick(obj, keys)` |

## When to add vs reuse

Before writing a new helper:

1. Search the whole `packages/utils/src/` tree for similar names (the categories overlap deliberately).
2. Check `function.ts`, `object/`, `is.ts` first — they hold the most generic primitives.
3. Check `browser/` if it touches DOM.
4. If the helper is component-specific (e.g. "compute BEM class for size"), it does **not** belong here — push it into `@lun-web/components/src/utils/` or `hooks/`.

## Don't

- Don't export a default. Named exports only.
- Don't ship a re-export from `'lodash'` / similar. Implement what you need, keep the surface small.
- Don't import from `'@lun-web/*'` (cycles).
- Don't introduce a "private" function that other packages then import via deep path. If it's used outside the file, give it a name and export it from `index.ts`.
- Don't add comments restating the function name. Save comments for non-obvious edge cases (browser quirks, spec gotchas).

## Tests

- Vitest, `environment: 'node'`. Pure unit tests.
- Browser-only utils can still be tested in node by stubbing globals if you're careful — usually easier to leave them to the components-side test suite.
