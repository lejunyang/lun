# `@lun-web/plugins` — AGENTS.md

> Compile-time helpers: Vue compiler-core directive transforms (`v-update`, `v-content`) and the Babel equivalent for Vue JSX.
> Root guide: [`../../AGENTS.md`](../../AGENTS.md). Chinese: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## Layout

```
src/
  vue/
    vue.index.ts       — barrel: re-exports vContent + vUpdate
    vContent.ts        — runtime directive (registered via app.directive('content', vContent) in apiCustomElement)
    vUpdate.ts         — compile-time directive transform: v-update[:field]="expr" → :value + @update
  babel/
    babel.index.ts     — barrel: re-exports vUpdate + rUpdate
    vUpdate.ts         — Babel JSX transform that mirrors the Vue v-update sugar
    rUpdate.ts         — Babel transform variant (React-side)
  __test__/            — unit tests via happy-dom
```

Package `exports`:

- `'./vue'` — compiled by consumer build tools (Vite, Nuxt …) and registered in `@vue/compiler-core` options.
- `'./babel'` — added to a Babel preset / plugin list for projects using Vue JSX or React JSX.

## What each plugin actually does

### `vUpdate` (Vue template compile-time)

`v-update:field="expr"` rewrites to two attributes:

```html
<l-input v-update:value="state.foo" />
<!-- becomes -->
<l-input :value="state.foo" @update="state.foo = $event.detail.value" />
```

- The arg (`:field`) controls which prop is bound (`value` is the default; `v-update-checked` works too).
- `expr` must be a member expression (`a.b`, `arr[0]`) — the transform assigns through it.
- Implementation: `createCustomEventModel({ name, regex, getTarget, event })` in `src/vue/vUpdate.ts`. Use this factory if you need a second sugar (e.g. `v-sync`).

### `vContent` (Vue runtime directive)

`v-content="bool"` toggles `content-visibility: hidden` (or `display: none` as fallback). Registered automatically by `apiCustomElement` (`app.directive('content', vContent)`). Components don't need to import it.

### Babel `vUpdate` / `rUpdate`

Same semantics as the Vue compile-time `v-update`, applied at Babel JSX transform time so the sugar works in `*.tsx` files for both Vue JSX and React JSX.

## Hard rules

- `@vue/compiler-core` is a **peer dependency**, not a dependency. Same for `@babel/core` / `@babel/types`. Don't move them.
- Treat each export as a stable public API — consumers wire it into their build config and ad-hoc breakage is painful to debug.
- Don't ship runtime code that depends on `@vue/runtime-dom` — these plugins run at compile-time (Vue compile / Babel transform). The only runtime directive (`vContent`) is small and self-contained.

## Adding a new directive

1. Decide if it's compile-time (Vue compiler transform) or runtime (Vue ObjectDirective).
2. If compile-time, mirror `vUpdate.ts`:
   - Use `createStructuralDirectiveTransform` from `@vue/compiler-core`.
   - Validate node types (must be `NodeTypes.ELEMENT` etc.).
   - Push synthetic `DirectiveNode`s onto `node.props`. Don't try to mutate `exp` in place.
3. If runtime, mirror `vContent.ts`:
   - Export an `ObjectDirective` with `beforeMount`, `mounted`, `updated`, `unmounted` as needed.
   - Use private `Symbol` keys to store per-element state (`vContentVisibilityOriginal` is a good template). DEV-only labels (`__DEV__ ? 'name' : ''`) save bytes in prod.
   - Register it in `apiCustomElement.ts`'s `configureApp` if it should be auto-available.
4. Add to `vue.index.ts`. Add a test under `__test__/`.

## Babel side

`@babel/types` is the structured representation. `@babel/plugin-syntax-jsx` is the parser plugin. The two `vUpdate.ts` / `rUpdate.ts` files traverse JSX expressions, find directive attributes, and rewrite into a `value` + `onUpdate` pair. Keep the implementations in sync with the Vue side semantically — drift here causes "works in template, not in JSX" bugs.

## Don't

- Don't write code that imports `vue` (the runtime). Only `@vue/compiler-core` / `@vue/runtime-core` types where needed.
- Don't import from `@lun-web/components` — this package sits below components in the dependency graph by design.
- Don't introduce a build-time helper that requires reading the user's project config. The plugins must be drop-in.
