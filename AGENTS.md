# AGENTS.md — Lun (`@lun-web/*`)

> Guide for AI coding agents (Claude, Copilot, Cursor, …) working in this repo.
> Human-oriented overview lives in `README.md` / `README.zh-CN.md`.
> Chinese version: [`AGENTS.zh-CN.md`](./AGENTS.zh-CN.md).

## 1. What this project is

`Lun` is a **cross-framework Web Components library**. The runtime authoring layer is **Vue 3**, but every published component ships as a **Custom Element backed by Shadow DOM**, so consumers from any framework (or vanilla HTML) use them through the DOM, not through a Vue API. The library leans heavily into modern web APIs (Popover, CSS Anchor Positioning, CustomStateSet, View Transitions, container queries, `calc-size`, …) with graceful fallbacks.

Key implications you must internalise:

- Components are **defined as custom elements** via a wrapped `defineCustomElement` (in `packages/components/src/custom/apiCustomElement.ts`). This is **not** the upstream Vue helper — it has been forked and rewritten. Do not import `defineCustomElement` from `'vue'`.
- Each component lives in its **own shadow root**. Parent / child provide / inject crosses shadow boundaries via a custom `_findParent` walk (slots → `parentNode` → `host` → `virtualParentMap`). When in doubt, read `apiCustomElement.ts` before assuming Vue semantics apply.
- `props` map to **attributes** (kebab-case reflected) and **properties** (camelCase). Events are dispatched as native `CustomEvent`s whose name style is configurable (`camel` / `kebab` / `pascal` / `lower` / `upper`).
- A central `GlobalStaticConfig` / `GlobalContextConfig` (in `packages/components/src/components/config/`) drives namespace, BEM separators, default props, attribute transforms, event name style, theme defaults, presets (`math`, `date`), and per-component styles. Reading these is often the answer to "how does X get configured".

## 2. Repo layout (monorepo, pnpm workspaces)

```
packages/
  components/   # the published @lun-web/components — custom elements live here
  core/         # framework-agnostic + Vue-aware hooks/composables/presets (no DOM components)
  utils/        # pure JS utils (no Vue, no DOM-only deps)
  theme/        # default theme: SCSS sources + JS bundle that registers styles
  plugins/      # Vue compiler-core directive transforms (v-update, v-content) + Babel equivalent
  react/        # React wrapper components for users on React <19 (or 19, separate build)
src/            # VitePress documentation site (also doubles as dev playground)
utils/          # build / test / docgen scripts (vite plugins, testSetup, doc generators)
public/
tsconfig.*.json # base / docs.react / node — paths are resolved relative to each tsconfig (no baseUrl)
vitest.workspace.ts  # per-package test environment (browser via Playwright for components/react)
pnpm-workspace.yaml  # pnpm catalogs pin vue, react, vite, typescript, postcss-logical, etc.
```

Dependency direction (strict — never reverse):

```
utils  ←  core  ←  components  ←  react
                              ↖   theme   (depends on components for types/helpers only)
plugins ← (consumed by components at runtime via Vue's directive system)
```

`utils` must not import Vue. `core` may import Vue but must not import `components`. `theme` and `react` depend on `components`.

## 3. The dev / build / test loop

### Bootstrap

```bash
pnpm install          # node >= 20, pnpm >= 9.9.0
pnpm build            # REQUIRED on first checkout — components/index ts builds the .d.ts files
                      # that tsconfig.json's `types` field points at; the docs site won't typecheck
                      # without them
pnpm dev              # starts vitepress dev server against src/docs
```

`pnpm build` runs `pnpm --filter "./packages/**" run build`. Each package's `build` script chains three Vite builds:

- `build:dev`  — `NODE_ENV=development`, keeps `__DEV__` warnings & dev-only branches
- `build:prod` — `NODE_ENV=production`, dead-code-eliminates dev branches
- `build:iife` — single-file UMD-ish bundle for jsdelivr / unpkg

Use `pnpm build:noType` for fast iteration when you don't need `.d.ts` regenerated.

### Tests

```bash
pnpm test                            # all packages via vitest workspaces
pnpm exec playwright install         # required once before running browser tests
pnpm --filter @lun-web/components test
```

- `components` and `react` tests run **in a real browser** (Playwright + Chromium) because they exercise shadow DOM, custom elements, layout. Do **not** convert these to happy-dom — many tests assume real layout and CSSOM behaviour.
- `core` / `theme` / `plugins` run in `happy-dom`, `utils` runs in `node`.
- `utils/testSetup.ts` exposes a global `l(tagName, props, options)` helper for components tests — use it to mount custom elements; teardown happens automatically `afterEach`.

### Docs / playground

`src/docs` is a VitePress site. Many docs pages are `.vue.tsx` (Vue) or `.react.tsx` (React) — both compile under VitePress via dedicated tsconfigs. When you add a new component, also add a doc page; the doc tooling at `utils/generateAndLinkDocs.js` picks them up.

## 4. Cross-cutting conventions

### 4.1 TypeScript / module resolution

- `paths` aliases (`common`, `config`, `custom`, `utils`, `hooks`, `@lun-web/*`, `data`) live in `tsconfig.json` and **are mirrored in each package's `vite.config.ts`**. If you add a new alias, you must update **both** places, otherwise editor types diverge from build output.
- `baseUrl` was removed (deprecated in TS 6). Do not reintroduce it. Path aliases resolve relative to the tsconfig file itself.
- Public types of every package come from a top-level `index.ts` re-export — never import from `dist/`.

### 4.2 Imports

- Use the alias form inside `packages/components`: `import { ... } from 'common'` / `'hooks'` / `'utils'` / `'config'` / `'custom'`. Relative deep paths (`../../common/...`) are tolerated only when avoiding a circular import (see comments in `apiCustomElement.ts` that explicitly avoid `../utils`).
- Cross-package always uses the public name: `import { ... } from '@lun-web/core'` / `'@lun-web/utils'` / `'@lun-web/plugins/vue'`.
- Never reach into another package's `src/` from outside — always go through its `index.ts`.

### 4.3 Naming

| Thing | Convention | Example |
|---|---|---|
| Custom element tag | `<namespace>-<comp>`, default `l-` | `l-button`, `l-form-item` |
| Vue component name in `defineCustomElement({ name })` | kebab-case, **matches the comp key** | `name: 'button'` |
| Component file | PascalCase `.tsx` | `Button.tsx`, `FormItem.tsx` |
| Side-effect register file | `<name>.define.ts` — single import + call | `button.define.ts` |
| Type file | `type.ts` colocated with component | `components/button/type.ts` |
| Component dir folder name | kebab-case singular | `components/form-item/` |
| Composables / hooks | camelCase, prefix `use` | `useNamespace`, `useSetupEdit` |
| BEM classes (built by `useNamespace`) | `l-block`, `l-block__element`, `l-block--modifier`, `is-state` | `l-input__suffix`, `l-button--variant-soft`, `is-checked` |
| Shadow part name | `<part> <comp>-<part>` (two tokens) | `part="root button-root"` via `getCompParts` |
| Type aliases for instance / element | `iFoo` for instance, `tFoo` for element constructor | `iButton`, `tButton` |
| React wrapper component | `L<Name>` | `LButton`, `LFormItem` |

### 4.4 The component skeleton

Every component in `packages/components/src/components/<name>/<Name>.tsx` follows the same shape. Copy and adapt — **don't invent new patterns** without strong reason.

```tsx
import { defineCustomElement } from 'custom';
import { useSetupEdit } from '@lun-web/core';
import { createDefineElement, renderElement } from 'utils';
import { useCEExpose, useCEStates, useNamespace } from 'hooks';
import { ElementWithExpose, getCompParts } from 'common';
import { fooEmits, fooProps } from './type';

const name = 'foo';                                    // matches the kebab tag suffix
const parts = ['root', 'inner'] as const;              // exposed shadow ::part names
const compParts = getCompParts(name, parts);           // -> ['root foo-root', 'inner foo-inner']

export const Foo = defineCustomElement({
  name,
  props: fooProps,
  emits: fooEmits,
  // formAssociated: true,                             // opt in when the component participates in <form>
  setup(props, { emit }) {
    const ns = useNamespace(name);
    const [editComputed, editState] = useSetupEdit(); // disabled/readonly/loading inheritance
    const [stateClass] = useCEStates(() => ({ /* booleans → is-* classes & CustomStateSet */ }));

    useCEExpose({ /* methods exposed on the element instance */ });

    return () => (
      <div part={compParts[0]} class={stateClass.value}>
        <slot />
      </div>
    );
  },
});

export type FooExpose = { /* methods/getters exposed via useCEExpose */ };
export type tFoo = ElementWithExpose<typeof Foo, FooExpose>;
export type iFoo = InstanceType<tFoo>;

export const defineFoo = createDefineElement(name, Foo, { /* default props */ }, parts, [/* dep defines */]);
```

Then in `foo.define.ts`:

```ts
import { defineFoo } from './Foo';
defineFoo();
```

And register the comp key in `packages/components/src/components/config/utils.ts` under the right shadow-mode list (`openShadowComponents` / `closedShadowComponents` / `noShadowComponents`) **and** in `defineAllComponents()` (`packages/components/src/components/index.ts`) **in dependency order** — providers (theme-provider, watermark, teleport-holder, accordion-group, table, tabs, form, …) must be defined before their children, because provide/inject relies on DOM-order parent lookup.

### 4.5 Props

- Build prop objects from the `PropString / PropNumber / PropBoolean / PropObject / PropResponsive / PropStrOrArr / PropObjOrFunc / Prop<T>()` factories in `common/propConstructor.ts`. These cache results and let Vue's CE attribute coercion work — **do not** hand-roll `{ type: String }`.
- Always `freeze({ ... })` the prop object.
- Common prop bags exist in `common/`: `editStateProps`, `themeProps`, `openShadowCommonProps`. Spread them as the first thing in a component's props.
- Default values are **not** put inside the prop options. They go in `createDefineElement(name, Comp, { defaults }, ...)` so they can be overridden via `GlobalStaticConfig.defaultProps[compKey]` at runtime. Reading defaults: `setDefaultsForPropOptions` in `components/src/utils/vueUtils.ts`.
- Boolean props that may be tri-state (open, status, etc.) use `undefBoolProp` so the default is `undefined`, not `false`.
- For value-like props that must accept anything but coerce empty string to boolean true (option's `value`, etc.) use `valueProp`.

### 4.6 Events / emits

- Declare with `createEmits<{ eventName: PayloadType | undefined }>(['eventName', ...])`. `undefined` payload means an event with no detail.
- Always provide the string list — runtime Vue needs it; TS info comes from the generic.
- Use existing emit bags where applicable: `closeEmits` / `openCloseEmits`.
- Events are dispatched as `CustomEvent`s; the `detail` field is auto-unwrapped (single argument → `detail = arg`, multiple → `detail = args[]`).
- Event name style is governed by `GlobalStaticConfig.eventNameStyle` (default emits in `camel`, `kebab`, `pascal` — so the same event fires three times with different names). Don't dispatch events manually with `dispatchEvent` from inside `setup` — use `emit`.

### 4.7 Slots, parts, and styling

- Compose elements with `renderElement('icon', { name: 'x' })` so the tag name follows the configured namespace and so `exportparts` is wired automatically.
- Every visible element should get a `part="..."` from `compParts` so consumers can `::part(...)` style it. Define the part list in the `as const` tuple, then reference by index — don't re-stringify.
- Class names are built by the `useNamespace(name)` helpers: `ns.b()`, `ns.e('element')`, `ns.m('modifier')`, `ns.be / em / bm / bem`, `ns.is('state', bool)`, `ns.isOr('state', bool)`, `ns.v({ var: value })` (for CSS custom properties), `ns.vn('varName')`. Use these — never hand-write `l-...` strings.
- Theme classes (size / color / variant / dark / high-contrast) are produced by `ns.t`. Apply them on the root element.

### 4.8 State, refs, expose

- Always pull `editComputed` from `useSetupEdit()`; gate every user interaction with `editComputed.interactive` (no disabled & no loading) or `editComputed.editable` (also no readonly). Don't read `props.disabled` directly.
- Use `useCEStates(getStateBag)` to reflect booleans into both `CustomStateSet` (when supported) and `is-*` classes / dataset attributes.
- Use `useCEExpose(methods, descriptors?)` to expose methods on the custom element instance — `useExpose` works *once* per Vue setup, this helper is additive.
- Use `interceptCEMethods(elRef)` when the host should delegate `focus()`, `blur()`, `click()` to an inner native element (input, button).
- `useSetupEvent` wraps `emit` so internal observers can intercept event dispatch (used by form-item for validation).
- Models: `useValueModel(props)`, `useOpenModel(props)`, `useCheckedModel(props)`. Built on `@lun-web/core`'s `createUseModel`. Do not hand-write `watch` + `emit('update')` patterns.

### 4.9 Form integration

- A form input opts in by setting `formAssociated: true` and using `useValueModel`. The form-item collector reads value, validation rules, and label automatically.
- The full validation rule prop set is in `form-item/type.ts` (`formItemRuleProps`) — `usePropsFromFormItem(props)` returns `{ status, validateProps, context }` that you spread into the underlying input.

### 4.10 SSR and provide/inject ordering

- Provider components MUST be registered before their children inside `defineAllComponents()`. Search for the comment "found that provide and inject are strongly rely on the dom order…" in `components/index.ts` if you need to extend the ordering.
- Use `defineSSRCustomElement` only when you specifically need hydratable declarative shadow root. Most components go through `defineCustomElement`.

### 4.11 Theming

- Default theme is loaded with `importAllThemes()` from `@lun-web/theme`. Each component's SCSS is registered through `createImportStyle(compKey, scssString)` (static) or `createImportDynamicStyle(compKey, fn)` (re-evaluates when context theme changes). Both are wrapped in `once()` so calling them multiple times is safe.
- BEM separators, CSS variable prefix, and `@layer` wrapping are all driven by `GlobalStaticConfig`. Theme SCSS reads CSS variables, never literal values.
- Color tokens come from `@radix-ui/colors`. `themeColors` (accent) and `grayColors` (neutral) lists are the source of truth — don't introduce a new colour in component code, add it to the theme tokens.

### 4.12 Plugins (Vue / Babel)

- `@lun-web/plugins/vue` exports `vUpdate` (compiler-core directive transform: `v-update[:field]="expr"` desugars to `:value` + `@update`) and `vContent` (`v-content` directive, the content-visibility analogue of `v-show`).
- `@lun-web/plugins/babel` is the JSX-time equivalent of `vUpdate`. Wire it into Babel for projects using Vue JSX that want `v-update` semantics in JSX.
- Both live under `peerDependencies` (`@vue/compiler-core`), not `dependencies` — don't break that.

### 4.13 React wrapper

- `packages/react` builds two parallel sets: `src/components/` (compat for React <19) and `src/components19/` (React 19 native custom element support). The `postinstall.cjs` selects which entry to expose based on the installed React version.
- A wrapper file is one-liner: `createComponent<Props, Instance>(compName, defineFn, props, emits)` (legacy) or `createComponent<Props, Instance>(compName, defineFn)` (React 19). Don't add per-component logic in the wrapper — push behaviour into the underlying custom element.

## 5. House rules (do / don't)

**Do**
- Read `apiCustomElement.ts` and `useNamespace.ts` before working on anything component-shaped — both are foundational and have non-obvious behaviour.
- Use the alias imports (`common`, `hooks`, …) inside `packages/components`.
- `freeze()` static config objects (props, emits, lists). The runtime checks for frozen-ness in some places.
- Wrap `createImportStyle` / `createImportDynamicStyle` registrations in module scope (they're already `once`-guarded internally).
- Add new comp keys to `openShadowComponents` / `closedShadowComponents` / `noShadowComponents` AND `defineAllComponents()`.
- When you add a SCSS file under `packages/theme/src/scss/components/<comp>/`, also wire its `createImportStyle` call in that folder's `index.ts`.

**Don't**
- Don't import Vue's `defineCustomElement` — use the local one in `custom`.
- Don't write `dispatchEvent(new CustomEvent(...))` from inside `setup` — use `emit`.
- Don't read `props.disabled` directly — go through `editComputed`.
- Don't hand-build BEM class strings — use `useNamespace`.
- Don't add `baseUrl` back to any tsconfig.
- Don't push runtime defaults into prop options — put them in `createDefineElement`'s third argument.
- Don't introduce circular deps between packages. `utils` cannot import anything; `core` cannot import `components`; `theme` cannot be imported by `components`.
- Don't add a comment that just restates what the code does. Comments earn their place by explaining a non-obvious **why** — a workaround, a Vue/Chrome quirk, a SSR ordering constraint, a Spec gotcha. There are plenty of good examples in the codebase (search for "must…", "FIXME", "bug starting from vue3.5"); match that tone.
- Don't ship dead code, half-done features, or speculative abstractions. The library is alpha — keep the surface lean.

## 6. Quick map: "where do I…"

| Task | Start here |
|---|---|
| Add a new component | Pick the most similar existing component (`button`, `switch`, `input`, `dialog`), copy its dir, then register in `config/utils.ts` and `defineAllComponents()` |
| Add a new prop to a component | `<comp>/type.ts` — add to the props object, add to the type, no default goes here |
| Change default prop value | `createDefineElement(name, Comp, { theKey: theValue }, ...)` at the bottom of `<Name>.tsx` |
| Add a new shadow part | Append to the `parts` tuple in `<Name>.tsx`, reference via `compParts[idx]` |
| Add a new state class | Add the key to the `useCEStates` object literal, then style via `[state="..."]` / `.is-...` |
| Add a hook reusable across components | `packages/components/src/hooks/` if it touches custom element / namespace concerns; `packages/core/src/hooks/` if it's framework-agnostic-ish |
| Add a pure JS util | `packages/utils/src/<category>/` — keep tree-shakeable, no Vue |
| Add a new colour or radius scale | `packages/theme/src/scss/common/` plus the theme-prop type in `common/themeProps.ts` |
| Add a new collector (parent/children) | `packages/core/src/composable/createCollector.ts` — copy an existing collector (form, select, tabs, tree, table) |
| Wire a Vue compile-time directive | `packages/plugins/src/vue/` |
| Add a doc page | `src/docs/components/<comp>/index.md` and a `_devTest.vue.tsx` (and `.react.tsx`) playground |

## 7. Per-package guides

Each package has its own `AGENTS.md` with the rules and pointers specific to that area. **Read it before doing meaningful work inside a package.**

- [`packages/components/AGENTS.md`](packages/components/AGENTS.md)
- [`packages/core/AGENTS.md`](packages/core/AGENTS.md)
- [`packages/utils/AGENTS.md`](packages/utils/AGENTS.md)
- [`packages/theme/AGENTS.md`](packages/theme/AGENTS.md)
- [`packages/plugins/AGENTS.md`](packages/plugins/AGENTS.md)
- [`packages/react/AGENTS.md`](packages/react/AGENTS.md)
